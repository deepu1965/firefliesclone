import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundError
from app.models.participant import Participant
from app.models.user import User
from app.repositories.meeting_repo import meeting_repo
from app.repositories.transcript_repo import transcript_repo
from app.schemas.meeting import MeetingCreate, MeetingListResponse, MeetingResponse, MeetingUpdate
from app.utils.transcript_parser import parse_transcript


async def _get_or_create_default_user(db: AsyncSession) -> User:
    from sqlalchemy import select

    result = await db.execute(select(User))
    user = result.scalars().first()
    if user:
        return user

    user = User(
        external_id=str(uuid.uuid4()).replace("-", ""),
        email="default@fireflies.ai",
        name="Default User",
    )
    db.add(user)
    await db.flush()
    return user


class MeetingService:
    async def list_meetings(
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
        return await meeting_repo.list(
            db,
            q=q,
            date_from=date_from,
            date_to=date_to,
            participant=participant,
            sort_by=sort_by,
            page=page,
            page_size=page_size,
        )

    async def get_meeting(self, db: AsyncSession, external_id: str) -> MeetingResponse:
        meeting = await meeting_repo.get_with_participants(db, external_id)
        if not meeting:
            raise NotFoundError(f"Meeting '{external_id}' not found")
        return meeting_repo.to_response(meeting)

    async def create_meeting(self, db: AsyncSession, data: MeetingCreate) -> MeetingResponse:
        host_user = await _get_or_create_default_user(db)

        meeting = await meeting_repo.create(
            db,
            title=data.title,
            host_user_id=host_user.id,
            started_at=data.started_at,
            duration_seconds=data.duration_seconds,
            audio_url=data.audio_url,
            meeting_url=data.meeting_url,
        )

        for p_data in data.participants:
            participant = Participant(
                meeting_id=meeting.id,
                name=p_data.name,
                email=p_data.email,
                role=p_data.role,
                speaker_label=p_data.speaker_label,
            )
            db.add(participant)

        if data.transcript_text:
            transcript = await transcript_repo.create_transcript(
                db,
                meeting_id=meeting.id,
                source="uploaded",
                raw_text=data.transcript_text,
            )
            segments = parse_transcript(data.transcript_text, fmt="txt")
            await transcript_repo.bulk_insert_segments(db, transcript.id, segments)

        await db.commit()
        refreshed = await meeting_repo.get_with_participants(db, meeting.external_id)
        return meeting_repo.to_response(refreshed)

    async def update_meeting(
        self, db: AsyncSession, external_id: str, data: MeetingUpdate
    ) -> MeetingResponse:
        meeting = await meeting_repo.get_with_participants(db, external_id)
        if not meeting:
            raise NotFoundError(f"Meeting '{external_id}' not found")

        await meeting_repo.update(
            db,
            meeting,
            title=data.title,
            started_at=data.started_at,
            duration_seconds=data.duration_seconds,
            audio_url=data.audio_url,
            meeting_url=data.meeting_url,
        )
        await db.commit()
        refreshed = await meeting_repo.get_with_participants(db, external_id)
        return meeting_repo.to_response(refreshed)

    async def delete_meeting(self, db: AsyncSession, external_id: str) -> None:
        meeting = await meeting_repo.get_by_external_id(db, external_id)
        if not meeting:
            raise NotFoundError(f"Meeting '{external_id}' not found")
        await meeting_repo.delete(db, meeting)

    async def get_participants(self, db: AsyncSession, external_id: str) -> list:
        meeting = await meeting_repo.get_with_participants(db, external_id)
        if not meeting:
            raise NotFoundError(f"Meeting '{external_id}' not found")
        from app.schemas.participant import ParticipantResponse
        return [ParticipantResponse.model_validate(p) for p in meeting.participants]


meeting_service = MeetingService()
