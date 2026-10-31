from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from database import get_db
from dependencies import require_student
from models import ChatHistory, ChatMessage

router = APIRouter(
    prefix="/api/student/chats",
    tags=["Student Chats"],
)


class CreateMessageRequest(BaseModel):
    content: str = Field(min_length=1, max_length=10000)


class MessageResponse(BaseModel):
    id: int
    chat_id: int
    role: str
    content: str
    created_at: datetime
    
class CreateChatRequest(BaseModel):
    title: str = Field(
        default="New Conversation",
        min_length=1,
        max_length=255,
    )

class ChatResponse(BaseModel):
    id: int
    title: str
    summary: str | None
    status: str
    created_at: datetime
    updated_at: datetime


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
    chats = (
        db.query(ChatHistory)
        .filter(
            ChatHistory.student_id == current_user["user_id"],
            ChatHistory.is_deleted.is_(False),
        )
        .order_by(ChatHistory.updated_at.desc(), ChatHistory.id.desc())
        .all()
    )

    return chats

@router.post("/{chat_id}/messages", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
def create_message(
    chat_id: int,
    message_data: CreateMessageRequest,
    current_user: dict = Depends(require_student),
    db: Session = Depends(get_db),
):
    # Find the conversation and make sure it belongs to this student.
    chat = (
        db.query(ChatHistory)
        .filter(
            ChatHistory.id == chat_id,
            ChatHistory.student_id == current_user["user_id"],
            ChatHistory.is_deleted.is_(False),
        )
        .first()
    )

    if chat is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found",
        )

    content = message_data.content.strip()

    if not content:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Message cannot be empty",
        )

    message = ChatMessage(
        chat_id=chat.id,
        role="user",
        content=content,
    )

    db.add(message)
    db.commit()
    db.refresh(message)

    return message

@router.get("/{chat_id}/messages", response_model=list[MessageResponse])
def list_chat_messages(
    chat_id: int,
    current_user: dict = Depends(require_student),
    db: Session = Depends(get_db),
):
    # Check that the conversation belongs to the logged-in student.
    chat = (
        db.query(ChatHistory)
        .filter(
            ChatHistory.id == chat_id,
            ChatHistory.student_id == current_user["user_id"],
            ChatHistory.is_deleted.is_(False),
        )
        .first()
    )

    if chat is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found",
        )

    messages = (
        db.query(ChatMessage)
        .filter(ChatMessage.chat_id == chat_id)
        .order_by(ChatMessage.created_at.asc(), ChatMessage.id.asc())
        .all()
    )

    return messages