import os
from datetime import datetime
from typing import Optional

import httpx
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from database import get_db
from dependencies import require_student
from models import ChatHistory, ChatMessage

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

    assistant_message = ChatMessage(
        chat_id=chat.id,
        role="assistant",
        content=answer.strip(),
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
