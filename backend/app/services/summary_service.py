import json
import logging
from datetime import datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.exceptions import NotFoundError
from app.models.summary import Summary
from app.repositories.meeting_repo import meeting_repo
from app.repositories.transcript_repo import transcript_repo
from app.schemas.summary import SummaryResponse

logger = logging.getLogger("fireflies")


class SummaryService:
    async def get_summary(self, db: AsyncSession, meeting_external_id: str) -> SummaryResponse:
        meeting = await meeting_repo.get_by_external_id(db, meeting_external_id)
        if not meeting:
            raise NotFoundError(f"Meeting '{meeting_external_id}' not found")

        result = await db.execute(
            select(Summary).where(Summary.meeting_id == meeting.id)
        )
        summary = result.scalar_one_or_none()
        if not summary:
            raise NotFoundError(f"No summary found for meeting '{meeting_external_id}'")

        return _to_response(summary)

    async def generate_summary(
        self, db: AsyncSession, meeting_external_id: str
    ) -> SummaryResponse:
        meeting = await meeting_repo.get_by_external_id(db, meeting_external_id)
        if not meeting:
            raise NotFoundError(f"Meeting '{meeting_external_id}' not found")

        existing_result = await db.execute(
            select(Summary).where(Summary.meeting_id == meeting.id)
        )
        existing = existing_result.scalar_one_or_none()

        if not settings.OPENAI_API_KEY:
            logger.warning("OPENAI_API_KEY not set — returning seeded summary")
            if existing:
                return _to_response(existing)
            raise NotFoundError(f"No summary for meeting '{meeting_external_id}' and LLM not configured")

        transcript = await transcript_repo.get_by_meeting_id(db, meeting.id)
        transcript_text = ""
        if transcript:
            if transcript.raw_text:
                transcript_text = transcript.raw_text
            elif transcript.segments:
                transcript_text = "\n".join(
                    f"{seg.speaker_name}: {seg.text}" for seg in transcript.segments
                )

        if not transcript_text:
            if existing:
                return _to_response(existing)
            raise NotFoundError(f"No transcript content for meeting '{meeting_external_id}'")

        try:
            from app.utils.llm_client import generate_summary as llm_generate

            llm_result = await llm_generate(transcript_text, settings)
            overview = llm_result.get("overview", "")
            key_points = [ai.get("text", ai) if isinstance(ai, dict) else ai for ai in llm_result.get("action_items", [])]
            next_steps = [t.get("title", t) if isinstance(t, dict) else t for t in llm_result.get("topics", [])]

            if existing:
                existing.overview = overview
                existing.key_points = json.dumps(key_points)
                existing.next_steps = json.dumps(next_steps)
                existing.generated_by = "llm"
                existing.generated_at = datetime.utcnow()
                await db.commit()
                await db.refresh(existing)
                return _to_response(existing)
            else:
                summary = Summary(
                    meeting_id=meeting.id,
                    overview=overview,
                    key_points=json.dumps(key_points),
                    next_steps=json.dumps(next_steps),
                    generated_by="llm",
                    generated_at=datetime.utcnow(),
                )
                db.add(summary)
                await db.commit()
                await db.refresh(summary)
                return _to_response(summary)

        except Exception as exc:
            logger.warning("LLM generation failed: %s — returning existing summary", exc)
            if existing:
                return _to_response(existing)
            raise NotFoundError(f"LLM failed and no fallback summary for meeting '{meeting_external_id}'") from exc


def _to_response(summary: Summary) -> SummaryResponse:
    key_points = None
    if summary.key_points:
        try:
            key_points = json.loads(summary.key_points)
        except (json.JSONDecodeError, TypeError):
            key_points = None

    next_steps = None
    if summary.next_steps:
        try:
            next_steps = json.loads(summary.next_steps)
        except (json.JSONDecodeError, TypeError):
            next_steps = None

    return SummaryResponse(
        id=summary.id,
        meeting_id=summary.meeting_id,
        overview=summary.overview,
        key_points=key_points,
        next_steps=next_steps,
        generated_by=summary.generated_by,
        generated_at=summary.generated_at,
        created_at=summary.created_at,
        updated_at=summary.updated_at,
    )


summary_service = SummaryService()
