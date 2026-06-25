import uuid
from datetime import date
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.action_item import ActionItem
from app.repositories.base import BaseRepository
from app.schemas.action_item import ActionItemCreate, ActionItemResponse, ActionItemUpdate


class ActionItemRepository(BaseRepository[ActionItem]):
    def __init__(self) -> None:
        super().__init__(ActionItem)

    async def list_by_meeting(
        self, db: AsyncSession, meeting_id: int, status: Optional[str] = None
    ) -> list[ActionItem]:
        stmt = select(ActionItem).where(ActionItem.meeting_id == meeting_id)
        if status and status != "all":
            stmt = stmt.where(ActionItem.status == status)
        stmt = stmt.order_by(ActionItem.created_at.asc())
        result = await db.execute(stmt)
        return list(result.scalars().all())

    async def create(
        self,
        db: AsyncSession,
        meeting_id: int,
        data: ActionItemCreate,
    ) -> ActionItem:
        item = ActionItem(
            external_id=str(uuid.uuid4()).replace("-", ""),
            meeting_id=meeting_id,
            description=data.description,
            assignee_name=data.assignee_name,
            due_date=data.due_date,
            priority=data.priority,
            status="pending",
        )
        db.add(item)
        await db.flush()
        await db.refresh(item)
        return item

    async def update(
        self,
        db: AsyncSession,
        item: ActionItem,
        data: ActionItemUpdate,
    ) -> ActionItem:
        if data.description is not None:
            item.description = data.description
        if data.status is not None:
            item.status = data.status
        if data.assignee_name is not None:
            item.assignee_name = data.assignee_name
        if data.due_date is not None:
            item.due_date = data.due_date
        if data.priority is not None:
            item.priority = data.priority
        await db.flush()
        await db.refresh(item)
        return item

    def to_response(self, item: ActionItem) -> ActionItemResponse:
        return ActionItemResponse.model_validate(item)


action_item_repo = ActionItemRepository()
