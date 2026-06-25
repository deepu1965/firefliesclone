from datetime import datetime

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Meeting(Base):
    __tablename__ = "meetings"
    __table_args__ = (
        CheckConstraint("duration_seconds >= 0", name="ck_meetings_duration"),
        CheckConstraint(
            "status IN ('scheduled','processing','processed','failed')",
            name="ck_meetings_status",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    external_id: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    title: Mapped[str] = mapped_column(String, nullable=False)
    host_user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    scheduled_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    started_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    ended_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    duration_seconds: Mapped[int | None] = mapped_column(Integer, nullable=True)
    status: Mapped[str] = mapped_column(String, nullable=False, default="processed")
    audio_url: Mapped[str | None] = mapped_column(String, nullable=True)
    meeting_url: Mapped[str | None] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)

    host: Mapped["User"] = relationship("User", back_populates="meetings")
    participants: Mapped[list["Participant"]] = relationship("Participant", back_populates="meeting", cascade="all, delete-orphan")
    transcript: Mapped["Transcript | None"] = relationship("Transcript", back_populates="meeting", cascade="all, delete-orphan", uselist=False)
    summary: Mapped["Summary | None"] = relationship("Summary", back_populates="meeting", cascade="all, delete-orphan", uselist=False)
    action_items: Mapped[list["ActionItem"]] = relationship("ActionItem", back_populates="meeting", cascade="all, delete-orphan")
    topics: Mapped[list["Topic"]] = relationship("Topic", back_populates="meeting", cascade="all, delete-orphan")
    meeting_tags: Mapped[list["MeetingTag"]] = relationship("MeetingTag", back_populates="meeting", cascade="all, delete-orphan")
