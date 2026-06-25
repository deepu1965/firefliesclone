from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Tag(Base):
    __tablename__ = "tags"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    color: Mapped[str] = mapped_column(String, nullable=False, default="#6366F1")
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)

    meeting_tags: Mapped[list["MeetingTag"]] = relationship("MeetingTag", back_populates="tag", cascade="all, delete-orphan")


class MeetingTag(Base):
    __tablename__ = "meeting_tags"

    meeting_id: Mapped[int] = mapped_column(ForeignKey("meetings.id", ondelete="CASCADE"), primary_key=True)
    tag_id: Mapped[int] = mapped_column(ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True)

    meeting: Mapped["Meeting"] = relationship("Meeting", back_populates="meeting_tags")
    tag: Mapped["Tag"] = relationship("Tag", back_populates="meeting_tags")
