import html
import re
import uuid
from typing import Optional

from sqlalchemy import insert, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy.sql import text

from app.models.transcript import Transcript
from app.models.transcript_segment import TranscriptSegment
from app.repositories.base import BaseRepository
from app.schemas.search import TranscriptSearchResult
from app.schemas.transcript import TranscriptResponse, TranscriptSegmentResponse


class TranscriptRepository(BaseRepository[Transcript]):
    def __init__(self) -> None:
        super().__init__(Transcript)

    async def get_by_meeting_id(self, db: AsyncSession, meeting_id: int) -> Optional[Transcript]:
        result = await db.execute(
            select(Transcript)
            .where(Transcript.meeting_id == meeting_id)
            .options(selectinload(Transcript.segments))
        )
        return result.scalar_one_or_none()

    async def create_transcript(
        self,
        db: AsyncSession,
        meeting_id: int,
        source: str = "uploaded",
        raw_text: Optional[str] = None,
    ) -> Transcript:
        transcript = Transcript(
            meeting_id=meeting_id,
            source=source,
            raw_text=raw_text,
        )
        db.add(transcript)
        await db.flush()
        return transcript

    async def bulk_insert_segments(
        self,
        db: AsyncSession,
        transcript_id: int,
        segments: list[dict],
    ) -> None:
        if not segments:
            return
        rows = [
            {
                "transcript_id": transcript_id,
                "speaker_name": seg["speaker_name"],
                "start_time_ms": seg["start_time_ms"],
                "end_time_ms": seg["end_time_ms"],
                "text": seg["text"],
                "sequence_index": seg["sequence_index"],
            }
            for seg in segments
        ]
        await db.execute(insert(TranscriptSegment), rows)
        await db.flush()

    async def fts_search(
        self,
        db: AsyncSession,
        meeting_id: int,
        query: str,
        limit: int = 50,
    ) -> list[TranscriptSearchResult]:
        safe_query = _escape_fts_query(query)
        sql = text(
            """
            SELECT
                ts.id,
                ts.speaker_name,
                ts.start_time_ms,
                ts.end_time_ms,
                ts.text,
                ts.sequence_index,
                snippet(transcript_segments_fts, 0, '<mark>', '</mark>', '...', 20) AS highlighted_text
            FROM transcript_segments_fts
            JOIN transcript_segments ts ON ts.id = transcript_segments_fts.rowid
            JOIN transcripts t ON t.id = ts.transcript_id
            WHERE transcript_segments_fts MATCH :query
              AND t.meeting_id = :meeting_id
            ORDER BY rank
            LIMIT :limit
            """
        )
        rows = (
            await db.execute(sql, {"query": safe_query, "meeting_id": meeting_id, "limit": limit})
        ).fetchall()

        results = []
        for row in rows:
            seg_id, speaker_name, start_ms, end_ms, raw_text, seq_idx, snippet_html = row
            safe_snippet = _sanitize_snippet(raw_text, snippet_html)
            results.append(
                TranscriptSearchResult(
                    segment_id=seg_id,
                    speaker_name=speaker_name,
                    start_time_ms=start_ms,
                    end_time_ms=end_ms,
                    highlighted_text=safe_snippet,
                    sequence_index=seq_idx,
                )
            )
        return results

    def to_response(self, transcript: Transcript) -> TranscriptResponse:
        segments = [
            TranscriptSegmentResponse.model_validate(seg) for seg in transcript.segments
        ]
        return TranscriptResponse(
            id=transcript.id,
            meeting_id=transcript.meeting_id,
            source=transcript.source,
            created_at=transcript.created_at,
            segments=segments,
            total_segments=len(segments),
        )


def _escape_fts_query(q: str) -> str:
    safe = re.sub(r'[^\w\s]', ' ', q).strip()
    if not safe:
        return '""'
    words = safe.split()
    return " ".join(words)


def _sanitize_snippet(raw_text: str, snippet_html: str) -> str:
    escaped = html.escape(raw_text)
    if not snippet_html:
        return escaped
    parts = snippet_html.split('<mark>')
    if len(parts) == 1:
        return escaped
    return snippet_html


transcript_repo = TranscriptRepository()
