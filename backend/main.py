import os
from datetime import timedelta
from dependencies import require_student, require_faculty
from routers.chatbot import router as chatbot_router

from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import get_db
from models import Student, Faculty
from schemas import LoginRequest, LoginResponse
from auth import verify_password, create_access_token

app = FastAPI(title="FacultyConnect AI API")
app.include_router(chatbot_router)

# Allow the React frontend to communicate with the backend.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {"message": "FacultyConnect AI API is running"}


@app.get("/api/health")
def health_check():
    return {"status": "healthy"}

@app.get("/api/student/profile")
def get_student_profile(
    current_user: dict = Depends(require_student),
    db: Session = Depends(get_db),
):
    student = db.query(Student).filter(
        Student.id == current_user["user_id"]
    ).first()

    if student is None:
        raise HTTPException(
            status_code=404,
            detail="Student not found",
        )

    return {
        "id": student.id,
        "name": student.name,
        "email": student.email,
        "user_type": "student",
    }
    
@app.get("/api/faculty/profile")
def get_faculty_profile(
    current_user: dict = Depends(require_faculty),
    db: Session = Depends(get_db),
):
    faculty = db.query(Faculty).filter(
        Faculty.id == current_user["user_id"]
    ).first()

    if faculty is None:
        raise HTTPException(
            status_code=404,
            detail="Faculty not found",
        )

    return {
        "id": faculty.id,
        "name": faculty.name,
        "email": faculty.email,
        "user_type": "faculty",
    }


def authenticate_user(email: str, password: str, user_type: str, db: Session):
    """Verify a user's university email and password."""

    if user_type == "student":
        user = (
            db.query(Student)
            .filter(Student.email == email)
            .first()
        )
    else:
        user = (
            db.query(Faculty)
            .filter(Faculty.email == email)
            .first()
        )

    # Use the same error message for an unknown email and wrong password.
    if user is None or not verify_password(password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid university email or password",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account is inactive. Please contact the university.",
        )

    return user


@app.post("/api/auth/student/login", response_model=LoginResponse)
def student_login(
    login_data: LoginRequest,
    db: Session = Depends(get_db),
):
    student = authenticate_user(
        email=login_data.email,
        password=login_data.password,
        user_type="student",
        db=db,
    )

    token = create_access_token(
        user_id=student.id,
        user_type="student",
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "user_id": student.id,
        "user_type": "student",
        "name": student.name,
        "email": student.email,
    }


@app.post("/api/auth/faculty/login", response_model=LoginResponse)
def faculty_login(
    login_data: LoginRequest,
    db: Session = Depends(get_db),
):
    faculty = authenticate_user(
        email=login_data.email,
        password=login_data.password,
        user_type="faculty",
        db=db,
    )

    token = create_access_token(
        user_id=faculty.id,
        user_type="faculty",
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "user_id": faculty.id,
        "user_type": "faculty",
        "name": faculty.name,
        "email": faculty.email,
    }