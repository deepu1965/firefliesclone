from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundError
from app.db.session import get_db
from app.models.meeting import Meeting
from app.models.topic import Topic
from app.schemas.topic import TopicResponse

router = APIRouter(tags=["topics"])


@router.get("/meetings/{meeting_id}/topics", response_model=list[TopicResponse])
async def list_topics(
    meeting_id: str,
    db: AsyncSession = Depends(get_db),
) -> list[TopicResponse]:
    meeting_result = await db.execute(
        select(Meeting).where(Meeting.external_id == meeting_id)
    )
    meeting = meeting_result.scalar_one_or_none()
    if not meeting:
        raise NotFoundError(f"Meeting '{meeting_id}' not found")

    topics_result = await db.execute(
        select(Topic)
        .where(Topic.meeting_id == meeting.id)
        .order_by(Topic.sequence_index.asc())
    )
    topics = topics_result.scalars().all()
    return [TopicResponse.model_validate(t) for t in topics]
