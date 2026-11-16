from datetime import date, timedelta
import re

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy import and_, or_
from sqlalchemy.orm import Session

from database import get_db
from dependencies import require_faculty, require_student
from models import Appointment, AvailabilitySlot, Faculty

router = APIRouter(prefix="/api/faculty", tags=["Faculty"])


class SlotCreate(BaseModel):
    slot_date: date
    start_time: str
    end_time: str


class SlotAvailabilityUpdate(BaseModel):
    is_available: bool


def slot_dict(slot):
    return {
        "id": slot.id, "faculty_id": slot.faculty_id,
        "slot_date": slot.slot_date.isoformat(),
        "start_time": slot.start_time.strftime("%H:%M"),
        "end_time": slot.end_time.strftime("%H:%M"),
        "is_available": slot.is_available,
    }


@router.get("/recommendations")
def recommend_faculty(
    q: str = Query(min_length=2, max_length=500),
    current_user: dict = Depends(require_student),
    db: Session = Depends(get_db),
):
    """Rank active faculty by overlap between the student's question and faculty profile."""
    terms = set(re.findall(r"[a-zA-Z0-9+#.]{2,}", q.lower()))
    stop = {"the", "and", "for", "with", "from", "can", "who", "help", "guide",
            "please", "about", "need", "want", "how", "what", "learn", "me"}
    terms -= stop
    faculty = db.query(Faculty).filter(Faculty.is_active.is_(True)).all()
    ranked = []
    for person in faculty:
        profile = " ".join(filter(None, [
            person.expertise, person.department, person.designation, person.bio
        ])).lower()
        profile_terms = set(re.findall(r"[a-zA-Z0-9+#.]{2,}", profile))
        overlap = terms & profile_terms
        score = len(overlap) / max(1, len(terms))
        if score > 0:
            ranked.append((score, person, sorted(overlap)))
    ranked.sort(key=lambda item: (-item[0], item[1].name.lower()))
    return [{
        "id": person.id, "name": person.name, "department": person.department,
        "designation": person.designation, "expertise": person.expertise,
        "bio": person.bio, "match_score": round(score, 3),
        "matched_terms": matched,
    } for score, person, matched in ranked[:5]]


@router.get("/{faculty_id}/slots")
def public_slots(
    faculty_id: int,
    from_date: date = Query(default_factory=date.today),
    to_date: date = Query(default_factory=lambda: date.today() + timedelta(days=30)),
    current_user: dict = Depends(require_student),
    db: Session = Depends(get_db),
):
    if to_date < from_date or (to_date - from_date).days > 90:
        raise HTTPException(400, "Choose a date range of at most 90 days.")
    person = db.query(Faculty).filter(
        Faculty.id == faculty_id, Faculty.is_active.is_(True)
    ).first()
    if not person:
        raise HTTPException(404, "Faculty member not found.")
    slots = db.query(AvailabilitySlot).filter(
        AvailabilitySlot.faculty_id == faculty_id,
        AvailabilitySlot.slot_date.between(from_date, to_date),
        AvailabilitySlot.is_available.is_(True),
        ~AvailabilitySlot.appointments.any(
            Appointment.status.in_(["pending", "confirmed", "completed"])
        ),
    ).order_by(AvailabilitySlot.slot_date, AvailabilitySlot.start_time).all()
    return [slot_dict(slot) for slot in slots]


@router.get("/availability/me/slots")
def my_slots(
    from_date: date = Query(default_factory=date.today),
    to_date: date = Query(default_factory=lambda: date.today() + timedelta(days=60)),
    current_user: dict = Depends(require_faculty),
    db: Session = Depends(get_db),
):
    if to_date < from_date or (to_date - from_date).days > 120:
        raise HTTPException(400, "Choose a date range of at most 120 days.")
    slots = db.query(AvailabilitySlot).filter(
        AvailabilitySlot.faculty_id == current_user["user_id"],
        AvailabilitySlot.slot_date.between(from_date, to_date),
    ).order_by(AvailabilitySlot.slot_date, AvailabilitySlot.start_time).all()
    booked_ids = {
        row[0] for row in db.query(Appointment.slot_id).filter(
            Appointment.faculty_id == current_user["user_id"],
            Appointment.status.in_(["pending", "confirmed", "completed"]),
        ).all()
    }
    return [{**slot_dict(slot), "is_booked": slot.id in booked_ids} for slot in slots]


@router.post("/availability/me/slots", status_code=201)
def create_slot(
    data: SlotCreate,
    current_user: dict = Depends(require_faculty),
    db: Session = Depends(get_db),
):
    from datetime import time
    try:
        start = time.fromisoformat(data.start_time)
        end = time.fromisoformat(data.end_time)
    except ValueError:
        raise HTTPException(422, "Times must use HH:MM format.")
    if data.slot_date < date.today():
        raise HTTPException(422, "Availability cannot be added in the past.")
    if end <= start:
        raise HTTPException(422, "End time must be later than start time.")
    overlap = db.query(AvailabilitySlot).filter(
        AvailabilitySlot.faculty_id == current_user["user_id"],
        AvailabilitySlot.slot_date == data.slot_date,
        AvailabilitySlot.start_time < end,
        AvailabilitySlot.end_time > start,
    ).first()
    if overlap:
        raise HTTPException(409, "This time overlaps an existing slot.")
    slot = AvailabilitySlot(
        faculty_id=current_user["user_id"], slot_date=data.slot_date,
        start_time=start, end_time=end, is_available=True,
    )
    db.add(slot)
    db.commit()
    db.refresh(slot)
    return slot_dict(slot)


@router.patch("/availability/me/slots/{slot_id}")
def update_slot(
    slot_id: int,
    data: SlotAvailabilityUpdate,
    current_user: dict = Depends(require_faculty),
    db: Session = Depends(get_db),
):
    slot = db.query(AvailabilitySlot).filter(
        AvailabilitySlot.id == slot_id,
        AvailabilitySlot.faculty_id == current_user["user_id"],
    ).first()
    if not slot:
        raise HTTPException(404, "Availability slot not found.")
    if not data.is_available and db.query(Appointment).filter(
        Appointment.slot_id == slot.id,
        Appointment.status.in_(["pending", "confirmed", "completed"]),
    ).first():
        raise HTTPException(409, "A booked slot cannot be blocked.")
    slot.is_available = data.is_available
    db.commit()
    db.refresh(slot)
    return slot_dict(slot)
