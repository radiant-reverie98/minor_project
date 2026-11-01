from typing import Literal

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from rag_chat import ask_bodhi

app = FastAPI(title="Bodhi AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


class HistoryMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    session_id: str = Field(min_length=1, max_length=100)
    question: str = Field(min_length=1, max_length=10000)
    chat_history: list[HistoryMessage] = Field(default_factory=list)


@app.post("/chat")
def chat(request: ChatRequest):
    history = [
        {"role": item.role, "content": item.content}
        for item in request.chat_history[-10:]
    ]

    try:
        answer = ask_bodhi(request.question.strip(), history)
    except Exception as exc:
        # Log full exception in the server console; avoid exposing secrets to clients.
        print(f"Bodhi generation error: {exc}")
        raise HTTPException(status_code=503, detail="Bodhi could not generate a response.")

    return {"session_id": request.session_id, "answer": answer}


@app.get("/")
def home():
    return {"message": "Bodhi AI API is running"}
