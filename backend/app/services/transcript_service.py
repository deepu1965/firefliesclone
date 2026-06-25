from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ConflictError, NotFoundError
from app.repositories.meeting_repo import meeting_repo
from app.repositories.transcript_repo import transcript_repo
from app.schemas.search import TranscriptSearchResponse
from app.schemas.transcript import TranscriptResponse
from app.utils.transcript_parser import parse_transcript


class TranscriptService:
    async def get_transcript(self, db: AsyncSession, meeting_external_id: str) -> TranscriptResponse:
        meeting = await meeting_repo.get_by_external_id(db, meeting_external_id)
        if not meeting:
            raise NotFoundError(f"Meeting '{meeting_external_id}' not found")

        transcript = await transcript_repo.get_by_meeting_id(db, meeting.id)
        if not transcript:
            raise NotFoundError(f"No transcript found for meeting '{meeting_external_id}'")

        return transcript_repo.to_response(transcript)

    async def create_transcript(
        self,
        db: AsyncSession,
        meeting_external_id: str,
        raw_text: Optional[str] = None,
        file_content: Optional[bytes] = None,
        filename: Optional[str] = None,
    ) -> TranscriptResponse:
        meeting = await meeting_repo.get_by_external_id(db, meeting_external_id)
        if not meeting:
            raise NotFoundError(f"Meeting '{meeting_external_id}' not found")

        existing = await transcript_repo.get_by_meeting_id(db, meeting.id)
        if existing:
            raise ConflictError(f"Meeting '{meeting_external_id}' already has a transcript")

        if file_content:
            content = file_content.decode("utf-8", errors="replace")
            fmt = _detect_format(filename or "")
        elif raw_text:
            content = raw_text
            fmt = "txt"
        else:
            content = ""
            fmt = "txt"

        transcript = await transcript_repo.create_transcript(
            db,
            meeting_id=meeting.id,
            source="uploaded",
            raw_text=content,
        )

        if content.strip():
            segments = parse_transcript(content, fmt=fmt)
            await transcript_repo.bulk_insert_segments(db, transcript.id, segments)

        await db.commit()

        refreshed = await transcript_repo.get_by_meeting_id(db, meeting.id)
        return transcript_repo.to_response(refreshed)

    async def search_transcript(
        self,
        db: AsyncSession,
        meeting_external_id: str,
        query: str,
        limit: int = 50,
    ) -> TranscriptSearchResponse:
        meeting = await meeting_repo.get_by_external_id(db, meeting_external_id)
        if not meeting:
            raise NotFoundError(f"Meeting '{meeting_external_id}' not found")

        results = await transcript_repo.fts_search(db, meeting.id, query, limit=limit)
        return TranscriptSearchResponse(query=query, total=len(results), results=results)


def _detect_format(filename: str) -> str:
    lower = filename.lower()
    if lower.endswith(".vtt"):
        return "vtt"
    if lower.endswith(".json"):
        return "json"
    return "txt"


transcript_service = TranscriptService()
