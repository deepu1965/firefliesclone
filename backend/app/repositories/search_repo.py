import re
from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.sql import text

from app.schemas.search import GlobalSearchResult, SearchResponse


class SearchRepository:
    async def global_search(
        self,
        db: AsyncSession,
        query: str,
        search_type: str = "all",
        limit: int = 30,
    ) -> SearchResponse:
        safe_query = _escape_fts_query(query)
        results: list[GlobalSearchResult] = []

        if search_type in ("all", "transcripts"):
            fts_sql = text(
                """
                SELECT
                    'segment' AS result_type,
                    m.external_id AS meeting_external_id,
                    m.title AS meeting_title,
                    ts.id AS segment_id,
                    ts.speaker_name,
                    ts.start_time_ms,
                    snippet(transcript_segments_fts, 0, '<mark>', '</mark>', '...', 20) AS highlighted_text,
                    rank AS score
                FROM transcript_segments_fts
                JOIN transcript_segments ts ON ts.id = transcript_segments_fts.rowid
                JOIN transcripts t ON t.id = ts.transcript_id
                JOIN meetings m ON m.id = t.meeting_id
                WHERE transcript_segments_fts MATCH :query
                ORDER BY rank
                LIMIT :limit
                """
            )
            rows = (await db.execute(fts_sql, {"query": safe_query, "limit": limit})).fetchall()
            for row in rows:
                result_type, meeting_eid, meeting_title, seg_id, speaker, start_ms, text_snip, score = row
                results.append(
                    GlobalSearchResult(
                        result_type=result_type,
                        meeting_external_id=meeting_eid,
                        meeting_title=meeting_title,
                        segment_id=seg_id,
                        speaker_name=speaker,
                        start_time_ms=start_ms,
                        text=text_snip or "",
                        score=float(score or 0),
                    )
                )

        if search_type in ("all", "meetings"):
            like_sql = text(
                """
                SELECT
                    'meeting' AS result_type,
                    m.external_id AS meeting_external_id,
                    m.title AS meeting_title,
                    NULL AS segment_id,
                    NULL AS speaker_name,
                    NULL AS start_time_ms,
                    m.title AS text,
                    0.0 AS score
                FROM meetings m
                WHERE m.title LIKE :like_q
                LIMIT :limit
                """
            )
            like_rows = (
                await db.execute(like_sql, {"like_q": f"%{query}%", "limit": limit})
            ).fetchall()
            for row in like_rows:
                result_type, meeting_eid, meeting_title, seg_id, speaker, start_ms, text_val, score = row
                if not any(r.meeting_external_id == meeting_eid and r.result_type == "meeting" for r in results):
                    results.append(
                        GlobalSearchResult(
                            result_type=result_type,
                            meeting_external_id=meeting_eid,
                            meeting_title=meeting_title,
                            segment_id=None,
                            speaker_name=None,
                            start_time_ms=None,
                            text=text_val or "",
                            score=float(score or 0),
                        )
                    )

        return SearchResponse(query=query, total=len(results), results=results[:limit])


def _escape_fts_query(q: str) -> str:
    safe = re.sub(r'[^\w\s]', ' ', q).strip()
    if not safe:
        return '""'
    return " ".join(safe.split())


search_repo = SearchRepository()
