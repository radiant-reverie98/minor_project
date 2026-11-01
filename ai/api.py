
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

from rag_chat import ask_bodhi

app = FastAPI(title="Bodhi AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict this in production
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Temporary in-memory conversation storage
sessions = {}


class ChatRequest(BaseModel):
    session_id: str
    question: str


@app.post("/chat")
def chat(request: ChatRequest):

    session_id = request.session_id

    if session_id not in sessions:
        sessions[session_id] = []

    history = sessions[session_id]

    answer = ask_bodhi(
        request.question,
        history
    )

    return {
        "session_id": session_id,
        "answer": answer
    }


@app.get("/")
def home():
    return {"message": "Bodhi AI API is running"}
