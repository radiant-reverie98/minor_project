from sqlalchemy import (
    BigInteger,
    Boolean,
    CheckConstraint,
    Column,
    Date,
    DateTime,
    Enum,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    Time,
    UniqueConstraint,
    Computed,
    text,
)
from sqlalchemy.dialects.mysql import TINYINT
from sqlalchemy.orm import relationship

from database import Base


# =====================================================
# TABLE 1: STUDENTS
# =====================================================

class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), nullable=False, unique=True)
    password_hash = Column(String(255), nullable=False)
    roll_no = Column(String(50), nullable=False, unique=True)
    department = Column(String(100), nullable=True)
    degree = Column(String(100), nullable=True)
    semester = Column(TINYINT(unsigned=True), nullable=True)

    is_active = Column(
        Boolean,
        nullable=False,
        server_default=text("1"),
    )

    created_at = Column(
        DateTime,
        nullable=False,
        server_default=text("CURRENT_TIMESTAMP"),
    )

    chats = relationship(
        "ChatHistory",
        back_populates="student",
    )

    appointments = relationship(
        "Appointment",
        back_populates="student",
    )


# =====================================================
# TABLE 2: FACULTY
# =====================================================

class Faculty(Base):
    __tablename__ = "faculty"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), nullable=False, unique=True)
    password_hash = Column(String(255), nullable=False)
    department = Column(String(100), nullable=True)
    designation = Column(String(100), nullable=True)

    is_active = Column(
        Boolean,
        nullable=False,
        server_default=text("1"),
    )

    created_at = Column(
        DateTime,
        nullable=False,
        server_default=text("CURRENT_TIMESTAMP"),
    )

    availability_slots = relationship(
        "AvailabilitySlot",
        back_populates="faculty",
    )

    appointments = relationship(
        "Appointment",
        back_populates="faculty",
    )

    solved_chats = relationship(
        "ChatHistory",
        back_populates="solver",
        foreign_keys="ChatHistory.solved_by",
    )


# =====================================================
# TABLE 3: AVAILABILITY SLOTS
# =====================================================

class AvailabilitySlot(Base):
    __tablename__ = "availability_slots"

    __table_args__ = (
        CheckConstraint(
            "end_time > start_time",
            name="chk_slot_time",
        ),
        Index(
            "idx_slot_faculty_date",
            "faculty_id",
            "slot_date",
        ),
        Index(
            "idx_slot_availability",
            "slot_date",
            "is_available",
        ),
    )

    id = Column(Integer, primary_key=True, autoincrement=True)

    faculty_id = Column(
        Integer,
        ForeignKey(
            "faculty.id",
            ondelete="RESTRICT",
        ),
        nullable=False,
    )

    slot_date = Column(Date, nullable=False)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)

    is_available = Column(
        Boolean,
        nullable=False,
        server_default=text("1"),
    )

    created_at = Column(
        DateTime,
        nullable=False,
        server_default=text("CURRENT_TIMESTAMP"),
    )

    faculty = relationship(
        "Faculty",
        back_populates="availability_slots",
    )

    appointments = relationship(
        "Appointment",
        back_populates="slot",
    )


# =====================================================
# TABLE 4: CHAT HISTORY
# Stores conversation details and AI-generated summary.
# Individual messages are stored in chat_messages.
# =====================================================

class ChatHistory(Base):
    __tablename__ = "chat_history"

    __table_args__ = (
        Index("idx_chat_student", "student_id"),
        Index("idx_chat_status", "status"),
        Index("idx_chat_deleted", "student_id", "is_deleted"),
    )

    id = Column(Integer, primary_key=True, autoincrement=True)

    student_id = Column(
        Integer,
        ForeignKey(
            "students.id",
            ondelete="RESTRICT",
        ),
        nullable=False,
    )

    title = Column(
        String(255),
        nullable=False,
        server_default=text("'New Conversation'"),
    )

    summary = Column(Text, nullable=True)

    status = Column(
        Enum("open", "solved"),
        nullable=False,
        server_default=text("'open'"),
    )

    is_deleted = Column(
        Boolean,
        nullable=False,
        server_default=text("0"),
    )

    created_at = Column(
        DateTime,
        nullable=False,
        server_default=text("CURRENT_TIMESTAMP"),
    )

    updated_at = Column(
        DateTime,
        nullable=False,
        server_default=text("CURRENT_TIMESTAMP"),
        onupdate=text("CURRENT_TIMESTAMP"),
    )

    closed_at = Column(DateTime, nullable=True)

    solved_by = Column(
        Integer,
        ForeignKey(
            "faculty.id",
            ondelete="RESTRICT",
        ),
        nullable=True,
    )

    student = relationship(
        "Student",
        back_populates="chats",
    )

    solver = relationship(
        "Faculty",
        back_populates="solved_chats",
        foreign_keys=[solved_by],
    )

    messages = relationship(
        "ChatMessage",
        back_populates="chat",
        order_by="(ChatMessage.created_at, ChatMessage.id)",
    )

    appointments = relationship(
        "Appointment",
        back_populates="chat",
    )


# =====================================================
# TABLE 5: CHAT MESSAGES
# Stores each individual user or assistant message.
# =====================================================

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    __table_args__ = (
        Index(
            "idx_chat_messages_order",
            "chat_id",
            "created_at",
            "id",
        ),
    )

    id = Column(
        BigInteger,
        primary_key=True,
        autoincrement=True,
    )

    chat_id = Column(
        Integer,
        ForeignKey(
            "chat_history.id",
            ondelete="RESTRICT",
        ),
        nullable=False,
    )

    role = Column(
        Enum("user", "assistant"),
        nullable=False,
    )

    content = Column(Text, nullable=False)

    created_at = Column(
        DateTime,
        nullable=False,
        server_default=text("CURRENT_TIMESTAMP"),
    )

    chat = relationship(
        "ChatHistory",
        back_populates="messages",
    )


# =====================================================
# TABLE 6: APPOINTMENTS
# Supports booking, confirmation, rejection and cancellation.
# =====================================================

class Appointment(Base):
    __tablename__ = "appointments"

    __table_args__ = (
        UniqueConstraint(
            "active_slot_id",
            name="uq_appointment_active_slot",
        ),
        Index(
            "idx_appointment_slot",
            "slot_id",
        ),
        Index(
            "idx_appointment_student",
            "student_id",
        ),
        Index(
            "idx_appointment_faculty",
            "faculty_id",
        ),
        Index(
            "idx_appointment_status",
            "status",
        ),
    )

    id = Column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    student_id = Column(
        Integer,
        ForeignKey(
            "students.id",
            ondelete="RESTRICT",
        ),
        nullable=False,
    )

    faculty_id = Column(
        Integer,
        ForeignKey(
            "faculty.id",
            ondelete="RESTRICT",
        ),
        nullable=False,
    )

    slot_id = Column(
        Integer,
        ForeignKey(
            "availability_slots.id",
            ondelete="RESTRICT",
        ),
        nullable=False,
    )

    chat_id = Column(
        Integer,
        ForeignKey(
            "chat_history.id",
            ondelete="RESTRICT",
        ),
        nullable=True,
    )

    topic = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)

    status = Column(
        Enum(
            "pending",
            "confirmed",
            "completed",
            "cancelled",
            "rejected",
        ),
        nullable=False,
        server_default=text("'pending'"),
    )

    # This column already exists in MySQL as a generated column.
    # It reserves slots for pending, confirmed and completed appointments.
    # Cancelled and rejected appointments produce NULL, allowing reuse.
    active_slot_id = Column(
        Integer,
        Computed(
            """
            CASE
                WHEN status IN ('pending', 'confirmed', 'completed')
                THEN slot_id
                ELSE NULL
            END
            """,
            persisted=True,
        ),
        nullable=True,
    )

    created_at = Column(
        DateTime,
        nullable=False,
        server_default=text("CURRENT_TIMESTAMP"),
    )

    updated_at = Column(
        DateTime,
        nullable=False,
        server_default=text("CURRENT_TIMESTAMP"),
        onupdate=text("CURRENT_TIMESTAMP"),
    )

    student = relationship(
        "Student",
        back_populates="appointments",
    )

    faculty = relationship(
        "Faculty",
        back_populates="appointments",
    )

    slot = relationship(
        "AvailabilitySlot",
        back_populates="appointments",
    )

    chat = relationship(
        "ChatHistory",
        back_populates="appointments",
    )