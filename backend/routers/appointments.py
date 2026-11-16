from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, joinedload

from database import get_db
from dependencies import require_faculty, require_student
from models import Appointment, AvailabilitySlot, ChatHistory, Faculty, Student

router = APIRouter(prefix="/api/appointments", tags=["Appointments"])


class BookingCreate(BaseModel):
    faculty_id: int = Field(gt=0)
    slot_id: int = Field(gt=0)
    chat_id: int | None = Field(default=None, gt=0)
    topic: str = Field(min_length=1, max_length=200)
    description: str | None = None


class StatusUpdate(BaseModel):
    status: str
    meeting_link: str | None = Field(default=None, max_length=500)


def serialize(appt):
    slot = appt.slot
    return {
        "id": appt.id, "student_id": appt.student_id,
        "student_name": appt.student.name,
        "student_department": appt.student.department,
        "student_roll_no": appt.student.roll_no,
        "faculty_id": appt.faculty_id, "faculty_name": appt.faculty.name,
        "faculty_department": appt.faculty.department,
        "slot_id": appt.slot_id, "slot_date": slot.slot_date.isoformat(),
        "start_time": slot.start_time.strftime("%H:%M"),
        "end_time": slot.end_time.strftime("%H:%M"),
        "topic": appt.topic, "description": appt.description,
        "status": appt.status, "meeting_link": appt.meeting_link,
        "created_at": appt.created_at.isoformat() if appt.created_at else None,
    }


def appointment_query(db):
    return db.query(Appointment).options(
        joinedload(Appointment.student),
        joinedload(Appointment.faculty),
        joinedload(Appointment.slot),
    )


@router.get("/mine")
def my_appointments(
    current_user: dict = Depends(require_student),
    db: Session = Depends(get_db),
):
    rows = appointment_query(db).filter(
        Appointment.student_id == current_user["user_id"]
    ).order_by(Appointment.created_at.desc()).all()
    return [serialize(row) for row in rows]


@router.get("/faculty")
def faculty_appointments(
    current_user: dict = Depends(require_faculty),
    db: Session = Depends(get_db),
):
    rows = appointment_query(db).filter(
        Appointment.faculty_id == current_user["user_id"]
    ).order_by(Appointment.created_at.desc()).all()
    return [serialize(row) for row in rows]


@router.post("/", status_code=201)
def book_appointment(
    data: BookingCreate,
    current_user: dict = Depends(require_student),
    db: Session = Depends(get_db),
):
    faculty = db.query(Faculty).filter(
        Faculty.id == data.faculty_id, Faculty.is_active.is_(True)
    ).first()
    if not faculty:
        raise HTTPException(404, "Faculty member not found.")
    slot = db.query(AvailabilitySlot).filter(
        AvailabilitySlot.id == data.slot_id,
        AvailabilitySlot.faculty_id == data.faculty_id,
        AvailabilitySlot.is_available.is_(True),
        AvailabilitySlot.slot_date >= date.today(),
    ).first()
    if not slot:
        raise HTTPException(409, "This slot is no longer available.")
    if db.query(Appointment).filter(
        Appointment.slot_id == slot.id,
        Appointment.status.in_(["pending", "confirmed", "completed"]),
    ).first():
        raise HTTPException(409, "This slot has already been booked.")
    if data.chat_id:
        chat = db.query(ChatHistory).filter(
            ChatHistory.id == data.chat_id,
            ChatHistory.student_id == current_user["user_id"],
            ChatHistory.is_deleted.is_(False),
        ).first()
        if not chat:
            raise HTTPException(404, "Conversation not found.")
    appt = Appointment(
        student_id=current_user["user_id"], faculty_id=data.faculty_id,
        slot_id=data.slot_id, chat_id=data.chat_id,
        topic=data.topic.strip(), description=data.description,
        status="pending",
    )
    db.add(appt)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(409, "This slot was just booked by someone else.")
    db.refresh(appt)
    return serialize(appointment_query(db).filter(Appointment.id == appt.id).first())


@router.patch("/{appointment_id}/status")
def update_appointment_status(
    appointment_id: int,
    data: StatusUpdate,
    current_user: dict = Depends(require_student),
    db: Session = Depends(get_db),
):
    raise HTTPException(405, "Use the faculty action endpoint to respond to a request.")


@router.patch("/{appointment_id}/faculty-status")
def faculty_update_status(
    appointment_id: int,
    data: StatusUpdate,
    current_user: dict = Depends(require_faculty),
    db: Session = Depends(get_db),
):
    appt = db.query(Appointment).filter(
        Appointment.id == appointment_id,
        Appointment.faculty_id == current_user["user_id"],
    ).first()
    if not appt:
        raise HTTPException(404, "Appointment not found.")
    if data.status not in ("confirmed", "rejected", "completed"):
        raise HTTPException(422, "Faculty can confirm, reject, or complete an appointment.")
    if data.status == "confirmed" and appt.status != "pending":
        raise HTTPException(409, "Only pending requests can be confirmed.")
    if data.status == "rejected" and appt.status != "pending":
        raise HTTPException(409, "Only pending requests can be rejected.")
    if data.status == "completed" and appt.status != "confirmed":
        raise HTTPException(409, "Only confirmed appointments can be completed.")
    appt.status = data.status
    if data.meeting_link is not None:
        appt.meeting_link = data.meeting_link
    db.commit()
    return serialize(appointment_query(db).filter(Appointment.id == appt.id).first())


@router.patch("/{appointment_id}/cancel")
def cancel_appointment(
    appointment_id: int,
    current_user: dict = Depends(require_student),
    db: Session = Depends(get_db),
):
    appt = db.query(Appointment).filter(
        Appointment.id == appointment_id,
        Appointment.student_id == current_user["user_id"],
    ).first()
    if not appt:
        raise HTTPException(404, "Appointment not found.")
    if appt.status not in ("pending", "confirmed"):
        raise HTTPException(409, "This appointment can no longer be cancelled.")
    appt.status = "cancelled"
    db.commit()
    return {"message": "Appointment cancelled."}
