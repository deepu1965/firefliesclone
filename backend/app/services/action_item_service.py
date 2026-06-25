from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundError
from app.repositories.action_item_repo import action_item_repo
from app.repositories.meeting_repo import meeting_repo
from app.schemas.action_item import ActionItemCreate, ActionItemResponse, ActionItemUpdate


class ActionItemService:
    async def list_action_items(
        self,
        db: AsyncSession,
        meeting_external_id: str,
        status: str | None = None,
    ) -> list[ActionItemResponse]:
        meeting = await meeting_repo.get_by_external_id(db, meeting_external_id)
        if not meeting:
            raise NotFoundError(f"Meeting '{meeting_external_id}' not found")

        items = await action_item_repo.list_by_meeting(db, meeting.id, status=status)
        return [action_item_repo.to_response(i) for i in items]

    async def create_action_item(
        self,
        db: AsyncSession,
        meeting_external_id: str,
        data: ActionItemCreate,
    ) -> ActionItemResponse:
        meeting = await meeting_repo.get_by_external_id(db, meeting_external_id)
        if not meeting:
            raise NotFoundError(f"Meeting '{meeting_external_id}' not found")

        item = await action_item_repo.create(db, meeting.id, data)
        await db.commit()
        await db.refresh(item)
        return action_item_repo.to_response(item)

    async def update_action_item(
        self,
        db: AsyncSession,
        item_external_id: str,
        data: ActionItemUpdate,
    ) -> ActionItemResponse:
        item = await action_item_repo.get_by_external_id(db, item_external_id)
        if not item:
            raise NotFoundError(f"Action item '{item_external_id}' not found")

        item = await action_item_repo.update(db, item, data)
        await db.commit()
        await db.refresh(item)
        return action_item_repo.to_response(item)

    async def delete_action_item(self, db: AsyncSession, item_external_id: str) -> None:
        item = await action_item_repo.get_by_external_id(db, item_external_id)
        if not item:
            raise NotFoundError(f"Action item '{item_external_id}' not found")

        await action_item_repo.delete(db, item)


action_item_service = ActionItemService()
