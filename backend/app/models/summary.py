from datetime import datetime

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Summary(Base):
    __tablename__ = "summaries"
    __table_args__ = (
        CheckConstraint(
            "generated_by IN ('seeded','llm','manual')",
            name="ck_summaries_generated_by",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    meeting_id: Mapped[int] = mapped_column(ForeignKey("meetings.id", ondelete="CASCADE"), unique=True, nullable=False)
    overview: Mapped[str | None] = mapped_column(Text, nullable=True)
    key_points: Mapped[str | None] = mapped_column(Text, nullable=True)   # JSON array of strings
    next_steps: Mapped[str | None] = mapped_column(Text, nullable=True)   # JSON array of strings
    generated_by: Mapped[str] = mapped_column(String, nullable=False, default="seeded")
    generated_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)

    meeting: Mapped["Meeting"] = relationship("Meeting", back_populates="summary")
