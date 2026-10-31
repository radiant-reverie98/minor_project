from datetime import date, datetime, time
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field, model_validator


# =====================================================
# COMMON CONFIGURATION
# =====================================================

class ORMBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)


# =====================================================
# LOGIN SCHEMAS
# =====================================================

class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_type: Literal["student", "faculty"]
    user_id: int
    name: str


# =====================================================
# STUDENT SCHEMAS
# =====================================================

class StudentCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    roll_no: str = Field(min_length=1, max_length=50)
    department: Optional[str] = Field(default=None, max_length=100)
    degree: Optional[str] = Field(default=None, max_length=100)
    semester: Optional[int] = Field(default=None, ge=1, le=20)


class StudentResponse(ORMBase):
    id: int
    name: str
    email: EmailStr
    roll_no: str
    department: Optional[str] = None
    degree: Optional[str] = None
    semester: Optional[int] = None
    is_active: bool
    created_at: datetime


# =====================================================
# FACULTY SCHEMAS
# =====================================================

class FacultyCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    department: Optional[str] = Field(default=None, max_length=100)
    designation: Optional[str] = Field(default=None, max_length=100)


class FacultyResponse(ORMBase):
    id: int
    name: str
    email: EmailStr
    department: Optional[str] = None
    designation: Optional[str] = None
    is_active: bool
    created_at: datetime


# =====================================================
# APPOINTMENT SCHEMAS
# =====================================================

AppointmentStatus = Literal[
    "pending",
    "confirmed",
    "completed",
    "cancelled",
    "rejected",
]


class AppointmentCreate(BaseModel):
    faculty_id: int = Field(gt=0)
    slot_id: int = Field(gt=0)
    chat_id: Optional[int] = Field(default=None, gt=0)
    topic: str = Field(min_length=1, max_length=200)
    description: Optional[str] = None


class AppointmentStatusUpdate(BaseModel):
    status: Literal["confirmed", "completed", "rejected", "cancelled"]


class AppointmentResponse(ORMBase):
    id: int
    student_id: int
    faculty_id: int
    slot_id: int
    chat_id: Optional[int] = None
    topic: str
    description: Optional[str] = None
    status: AppointmentStatus
    created_at: datetime
    updated_at: datetime


class AvailabilitySlotCreate(BaseModel):
    slot_date: date
    start_time: time
    end_time: time

    @model_validator(mode="after")
    def validate_slot_times(self):
        if self.end_time <= self.start_time:
            raise ValueError("End time must be later than start time.")
        return self


class AvailabilitySlotResponse(ORMBase):
    id: int
    faculty_id: int
    slot_date: date
    start_time: time
    end_time: time
    is_available: bool
    created_at: datetime


# =====================================================
# CHAT SCHEMAS
# =====================================================

class ChatCreate(BaseModel):
    title: str = Field(default="New Conversation", min_length=1, max_length=255)


class ChatResponse(ORMBase):
    id: int
    student_id: int
    title: str
    summary: Optional[str] = None
    status: Literal["open", "solved"]
    is_deleted: bool
    created_at: datetime
    updated_at: datetime
    closed_at: Optional[datetime] = None
    solved_by: Optional[int] = None


class ChatMessageCreate(BaseModel):
    role: Literal["user"]
    content: str = Field(min_length=1, max_length=10000)


class ChatMessageResponse(ORMBase):
    id: int
    chat_id: int
    role: Literal["user", "assistant"]
    content: str
    created_at: datetime


# =====================================================
# FACULTY-FACING CHAT SUMMARY
# Only approved student and summary fields are exposed.
# Individual messages are intentionally excluded.
# =====================================================

class FacultyChatSummary(BaseModel):
    student_name: str
    department: Optional[str] = None
    roll_no: str
    semester: Optional[int] = None
    degree: Optional[str] = None
    chat_title: str
    summary: Optional[str] = None