import os
from datetime import date, datetime, timedelta
from typing import Optional

import httpx
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from database import get_db
from dependencies import require_student
from models import Appointment, AvailabilitySlot, ChatHistory, ChatMessage, Faculty

router = APIRouter(prefix="/api/student/chats", tags=["Student Chats"])

AI_SERVICE_URL = os.getenv("AI_SERVICE_URL", "http://127.0.0.1:8001/chat")
AI_TIMEOUT_SECONDS = float(os.getenv("AI_TIMEOUT_SECONDS", "90"))
MAX_HISTORY_MESSAGES = 10


class CreateChatRequest(BaseModel):
    title: str = Field(default="New Conversation", min_length=1, max_length=255)


class CreateMessageRequest(BaseModel):
    content: str = Field(min_length=1, max_length=10000)


class ChatResponse(BaseModel):
    id: int
    title: str
    summary: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: datetime


class MessageResponse(BaseModel):
    id: int
    chat_id: int
    role: str
    content: str
    created_at: datetime
    message_metadata: Optional[dict] = None


class SendMessageResponse(BaseModel):
    user_message: MessageResponse
    assistant_message: MessageResponse


def get_owned_chat(db: Session, chat_id: int, student_id: int) -> ChatHistory:
    chat = (
        db.query(ChatHistory)
        .filter(
            ChatHistory.id == chat_id,
            ChatHistory.student_id == student_id,
            ChatHistory.is_deleted.is_(False),
        )
        .first()
    )
    if chat is None:
        raise HTTPException(status_code=404, detail="Conversation not found")
    if chat.status != "open":
        raise HTTPException(status_code=409, detail="This conversation is closed")
    return chat


def normalize_name(value: str) -> str:
    value = re.sub(r"^(dr|prof|professor)\.?\s*", "", value.strip().lower())
    return re.sub(r"[^a-z0-9]", "", value)


def is_booking_request(content: str) -> bool:
    text = content.lower()
    return bool(
        re.search(r"\b(book|schedule|arrange|set up|request)\b", text)
        and re.search(r"\b(appointment|meeting|consultation|slot)\b", text)
        or re.search(r"\b(book|schedule)\s+(him|her|them|it)\b", text)
        or re.search(r"\b(meet|talk to)\s+(him|her|them)\b", text)
    )


def latest_recommendations(messages):
    for message in reversed(messages):
        if message.role == "assistant":
            metadata = message.message_metadata or {}
            recommendations = metadata.get("faculty_recommendations") or []
            if recommendations:
                return recommendations
    return []


def resolve_booking_faculty(content, recommendations, faculty_rows):
    normalized_content = normalize_name(content)
    named = [
        person for person in faculty_rows
        if normalize_name(person.name) in normalized_content
    ]
    if len(named) == 1:
        return named[0]
    if len(named) > 1:
        return None

    # Resolve conversational references such as "book him" from the last
    # recommendation card, using its database ID rather than guessing a name.
    if re.search(r"\b(him|her|them|that teacher|that professor|the recommended)\b", content.lower()):
        recommended_ids = [item.get("id") for item in recommendations if item.get("id")]
        if len(recommended_ids) == 1:
            return next((p for p in faculty_rows if p.id == recommended_ids[0]), None)

    if len(recommendations) == 1:
        recommendation_id = recommendations[0].get("id")
        return next((p for p in faculty_rows if p.id == recommendation_id), None)
    return None


def faculty_card(person):
    return {
        "id": person.id,
        "name": person.name,
        "department": person.department,
        "designation": person.designation,
        "expertise": person.expertise,
    }


@router.post("/", response_model=ChatResponse, status_code=status.HTTP_201_CREATED)
def create_chat(
    chat_data: CreateChatRequest,
    current_user: dict = Depends(require_student),
    db: Session = Depends(get_db),
):
    chat = ChatHistory(
        student_id=current_user["user_id"],
        title=chat_data.title.strip() or "New Conversation",
    )
    db.add(chat)
    db.commit()
    db.refresh(chat)
    return chat


@router.get("/", response_model=list[ChatResponse])
def list_my_chats(
    current_user: dict = Depends(require_student),
    db: Session = Depends(get_db),
):
    return (
        db.query(ChatHistory)
        .filter(
            ChatHistory.student_id == current_user["user_id"],
            ChatHistory.is_deleted.is_(False),
        )
        .order_by(ChatHistory.updated_at.desc(), ChatHistory.id.desc())
        .all()
    )


@router.get("/{chat_id}/messages", response_model=list[MessageResponse])
def list_chat_messages(
    chat_id: int,
    current_user: dict = Depends(require_student),
    db: Session = Depends(get_db),
):
    get_owned_chat(db, chat_id, current_user["user_id"])
    return (
        db.query(ChatMessage)
        .filter(ChatMessage.chat_id == chat_id)
        .order_by(ChatMessage.created_at.asc(), ChatMessage.id.asc())
        .all()
    )


@router.post(
    "/{chat_id}/messages",
    response_model=SendMessageResponse,
    status_code=status.HTTP_201_CREATED,
)
def send_chat_message(
    chat_id: int,
    message_data: CreateMessageRequest,
    current_user: dict = Depends(require_student),
    db: Session = Depends(get_db),
):
    chat = get_owned_chat(db, chat_id, current_user["user_id"])
    content = message_data.content.strip()
    if not content:
        raise HTTPException(status_code=422, detail="Message cannot be empty")

    # Read prior turns before inserting the new user message.
    previous_messages = (
        db.query(ChatMessage)
        .filter(ChatMessage.chat_id == chat.id)
        .order_by(ChatMessage.created_at.desc(), ChatMessage.id.desc())
        .limit(MAX_HISTORY_MESSAGES)
        .all()
    )
    previous_messages.reverse()
    history = [
        {"role": msg.role, "content": msg.content}
        for msg in previous_messages
        if msg.role in ("user", "assistant")
    ]

    user_message = ChatMessage(chat_id=chat.id, role="user", content=content)
    db.add(user_message)
    chat.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(user_message)

    # Handle appointment intent in the application backend, not through RAG.
    # This keeps faculty identity and booking actions tied to real DB records.
    if is_booking_request(content):
        import re

        faculty_rows = db.query(Faculty).filter(Faculty.is_active.is_(True)).all()
        recommendations = latest_recommendations(previous_messages)
        faculty = resolve_booking_faculty(content, recommendations, faculty_rows)

        if faculty is None:
            if len(recommendations) > 1 and not re.search(r"\b(dr\.?|professor|prof\.)\b", content.lower()):
                answer = "Which faculty member would you like to book with? Please mention their name or choose one of the recommended faculty cards."
            else:
                answer = "I couldn't match that name to an active faculty account. Please check the faculty member's name or choose them from the recommended faculty cards."
            metadata = {"faculty_recommendations": recommendations}
        else:
            from_date = date.today()
            to_date = from_date + timedelta(days=30)
            slots = db.query(AvailabilitySlot).filter(
                AvailabilitySlot.faculty_id == faculty.id,
                AvailabilitySlot.slot_date.between(from_date, to_date),
                AvailabilitySlot.is_available.is_(True),
                ~AvailabilitySlot.appointments.any(
                    Appointment.status.in_(["pending", "confirmed", "completed"])
                ),
            ).order_by(
                AvailabilitySlot.slot_date, AvailabilitySlot.start_time
            ).all()

            metadata = {
                "faculty_booking": faculty_card(faculty),
                "faculty_recommendations": recommendations,
            }
            if slots:
                answer = (
                    f"Absolutely! I found {faculty.name}. Use the **Choose a slot** button "
                    "below to view their available consultation times and send an appointment request."
                )
            else:
                answer = (
                    f"I found {faculty.name}, but they have no available appointment slots "
                    "in the next 30 days. Please check again later or choose another faculty member."
                )

        assistant_message = ChatMessage(
            chat_id=chat.id,
            role="assistant",
            content=answer,
            message_metadata=metadata,
        )
        db.add(assistant_message)
        chat.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(assistant_message)
        return {"user_message": user_message, "assistant_message": assistant_message}

    try:
        with httpx.Client(timeout=AI_TIMEOUT_SECONDS) as client:
            ai_response = client.post(
                AI_SERVICE_URL,
                json={
                    "session_id": str(chat.id),
                    "question": content,
                    "chat_history": history,
                },
            )
            ai_response.raise_for_status()
            payload = ai_response.json()
            answer = payload.get("answer")

        if not isinstance(answer, str) or not answer.strip():
            raise ValueError("AI service returned an empty or invalid answer")

    except httpx.TimeoutException:
        raise HTTPException(
            status_code=504,
            detail="Bodhi took too long to respond. Your message was saved; please try again.",
        )
    except httpx.HTTPStatusError as exc:
        raise HTTPException(
            status_code=502,
            detail=f"AI service returned an error ({exc.response.status_code}). Your message was saved.",
        )
    except (httpx.HTTPError, ValueError, KeyError):
        raise HTTPException(
            status_code=502,
            detail="Could not get a response from Bodhi. Your message was saved; please try again.",
        )

    # Map FAISS-retrieved faculty JSON profiles to active faculty accounts.
    import re
    rag_matches = payload.get("faculty_matches") or []
    faculty_rows = db.query(Faculty).filter(Faculty.is_active.is_(True)).all()
    by_name = {
        re.sub(r"[^a-z0-9]", "", person.name.lower()): person
        for person in faculty_rows
    }
    recommendations = []
    for match in rag_matches:
        person = by_name.get(re.sub(r"[^a-z0-9]", "", str(match.get("name", "")).lower()))
        if person and float(match.get("distance", 99)) <= 1.8:
            recommendations.append({
                "id": person.id,
                "name": person.name,
                "department": person.department,
                "designation": person.designation,
                "expertise": person.expertise,
                "match_score": round(1 / (1 + max(0, float(match.get("distance", 99)))), 3),
            })
    # If FAISS has no matching faculty profile, fall back to explicit expertise keywords.
    if not recommendations:
        terms = set(re.findall(r"[a-zA-Z0-9+#.]{2,}", content.lower()))
        terms -= {"the", "and", "for", "with", "from", "can", "who", "help", "guide",
                  "please", "about", "need", "want", "how", "what", "me"}
        ranked = []
        for person in faculty_rows:
            profile = " ".join(filter(None, [
                person.expertise, person.department, person.designation, person.bio
            ])).lower()
            overlap = terms & set(re.findall(r"[a-zA-Z0-9+#.]{2,}", profile))
            if overlap:
                ranked.append((len(overlap) / max(1, len(terms)), person))
        ranked.sort(key=lambda item: (-item[0], item[1].name.lower()))
        recommendations = [{
            "id": person.id, "name": person.name, "department": person.department,
            "designation": person.designation, "expertise": person.expertise,
            "match_score": round(score, 3),
        } for score, person in ranked[:3]]

    assistant_message = ChatMessage(
        chat_id=chat.id,
        role="assistant",
        content=answer.strip(),
        message_metadata={"faculty_recommendations": recommendations},
    )
    db.add(assistant_message)
    chat.updated_at = datetime.utcnow()

    # Give a new conversation a useful title based on its first question.
    if chat.title == "New Conversation":
        chat.title = content[:60] + ("..." if len(content) > 60 else "")

    db.commit()
    db.refresh(assistant_message)

    return {
        "user_message": user_message,
        "assistant_message": assistant_message,
    }
