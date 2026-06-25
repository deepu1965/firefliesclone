import json
import math
import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy.sql import text

from app.models.meeting import Meeting
from app.models.participant import Participant
from app.models.summary import Summary
from app.repositories.base import BaseRepository
from app.schemas.meeting import MeetingListItem, MeetingListResponse, MeetingResponse
from app.schemas.participant import ParticipantResponse


class MeetingRepository(BaseRepository[Meeting]):
    def __init__(self) -> None:
        super().__init__(Meeting)

    async def list(
        self,
        db: AsyncSession,
        q: Optional[str] = None,
        date_from: Optional[datetime] = None,
        date_to: Optional[datetime] = None,
        participant: Optional[str] = None,
        sort_by: str = "recent",
        page: int = 1,
        page_size: int = 20,
    ) -> MeetingListResponse:
        needs_join = bool(q or participant)

        conditions = ["1=1"]
        params: dict = {}

        if needs_join:
            from_clause = "FROM meetings m LEFT JOIN participants p ON p.meeting_id = m.id"
        else:
            from_clause = "FROM meetings m"

        if q:
            conditions.append("(m.title LIKE :q OR p.name LIKE :q OR p.email LIKE :q)")
            params["q"] = f"%{q}%"

        if participant:
            conditions.append("p.name LIKE :participant")
            params["participant"] = f"%{participant}%"

        if date_from:
            conditions.append("m.started_at >= :date_from")
            params["date_from"] = date_from.isoformat()

        if date_to:
            conditions.append("m.started_at <= :date_to")
            params["date_to"] = date_to.isoformat()

        where_clause = " AND ".join(conditions)

        count_sql = f"SELECT COUNT(DISTINCT m.id) {from_clause} WHERE {where_clause}"
        total = (await db.execute(text(count_sql), params)).scalar_one() or 0

        order_clause = "COALESCE(m.started_at, m.created_at) DESC"
        if sort_by in ("name", "title_asc"):
            order_clause = "m.title ASC"
        elif sort_by in ("date_asc",):
            order_clause = "COALESCE(m.started_at, m.created_at) ASC"

        ids_sql = (
            f"SELECT DISTINCT m.id {from_clause} WHERE {where_clause} "
            f"ORDER BY {order_clause} LIMIT :limit OFFSET :offset"
        )
        params["limit"] = page_size
        params["offset"] = (page - 1) * page_size

        id_rows = (await db.execute(text(ids_sql), params)).fetchall()
        meeting_ids = [row[0] for row in id_rows]

        if not meeting_ids:
            pages = math.ceil(total / page_size) if page_size > 0 else 0
            return MeetingListResponse(
                items=[], total=total, page=page, page_size=page_size, pages=pages
            )

        stmt = (
            select(Meeting)
            .where(Meeting.id.in_(meeting_ids))
            .options(
                selectinload(Meeting.participants),
                selectinload(Meeting.summary),
            )
        )
        result = await db.execute(stmt)
        meetings_by_id: dict[int, Meeting] = {m.id: m for m in result.scalars().all()}
        meetings = [meetings_by_id[mid] for mid in meeting_ids if mid in meetings_by_id]

        items = [self._to_list_item(m) for m in meetings]
        pages = math.ceil(total / page_size) if page_size > 0 else 0
        return MeetingListResponse(
            items=items, total=total, page=page, page_size=page_size, pages=pages
        )

    def _to_list_item(self, meeting: Meeting) -> MeetingListItem:
        summary_preview: Optional[list[str]] = None
        if meeting.summary and meeting.summary.key_points:
            try:
                kp = json.loads(meeting.summary.key_points)
                summary_preview = kp[:2] if kp else None
            except (json.JSONDecodeError, TypeError):
                pass

        participants = [ParticipantResponse.model_validate(p) for p in meeting.participants]
        return MeetingListItem(
            external_id=meeting.external_id,
            title=meeting.title,
            started_at=meeting.started_at,
            duration_seconds=meeting.duration_seconds,
            status=meeting.status,
            audio_url=meeting.audio_url,
            created_at=meeting.created_at,
            participants=participants,
            summary_preview=summary_preview,
        )

    async def get_with_participants(self, db: AsyncSession, external_id: str) -> Optional[Meeting]:
        result = await db.execute(
            select(Meeting)
            .where(Meeting.external_id == external_id)
            .options(selectinload(Meeting.participants))
        )
        return result.scalar_one_or_none()

    async def create(
        self,
        db: AsyncSession,
        title: str,
        host_user_id: int,
        started_at: Optional[datetime] = None,
        duration_seconds: Optional[int] = None,
        audio_url: Optional[str] = None,
        meeting_url: Optional[str] = None,
    ) -> Meeting:
        meeting = Meeting(
            external_id=str(uuid.uuid4()).replace("-", ""),
            title=title,
            host_user_id=host_user_id,
            started_at=started_at,
            duration_seconds=duration_seconds,
            audio_url=audio_url,
            meeting_url=meeting_url,
            status="processed",
        )
        db.add(meeting)
        await db.flush()
        return meeting

    async def update(
        self,
        db: AsyncSession,
        meeting: Meeting,
        title: Optional[str] = None,
        started_at: Optional[datetime] = None,
        duration_seconds: Optional[int] = None,
        audio_url: Optional[str] = None,
        meeting_url: Optional[str] = None,
    ) -> Meeting:
        if title is not None:
            meeting.title = title
        if started_at is not None:
            meeting.started_at = started_at
        if duration_seconds is not None:
            meeting.duration_seconds = duration_seconds
        if audio_url is not None:
            meeting.audio_url = audio_url
        if meeting_url is not None:
            meeting.meeting_url = meeting_url
        await db.flush()
        return meeting

    def to_response(self, meeting: Meeting) -> MeetingResponse:
        participants = [ParticipantResponse.model_validate(p) for p in meeting.participants]
        return MeetingResponse(
            external_id=meeting.external_id,
            title=meeting.title,
            started_at=meeting.started_at,
            ended_at=meeting.ended_at,
            duration_seconds=meeting.duration_seconds,
            status=meeting.status,
            audio_url=meeting.audio_url,
            meeting_url=meeting.meeting_url,
            created_at=meeting.created_at,
            updated_at=meeting.updated_at,
            participants=participants,
        )


meeting_repo = MeetingRepository()
