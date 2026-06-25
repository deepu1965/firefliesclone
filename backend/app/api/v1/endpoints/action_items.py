from typing import Optional

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.schemas.action_item import ActionItemCreate, ActionItemResponse, ActionItemUpdate
from app.services.action_item_service import action_item_service

router = APIRouter(tags=["action_items"])


@router.get("/meetings/{meeting_id}/action-items", response_model=list[ActionItemResponse])
async def list_action_items(
    meeting_id: str,
    status_filter: Optional[str] = Query(
        None,
        alias="status",
        pattern="^(pending|in_progress|completed|all)$",
    ),
    db: AsyncSession = Depends(get_db),
) -> list[ActionItemResponse]:
    return await action_item_service.list_action_items(db, meeting_id, status=status_filter)


@router.post(
    "/meetings/{meeting_id}/action-items",
    response_model=ActionItemResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_action_item(
    meeting_id: str,
    data: ActionItemCreate,
    db: AsyncSession = Depends(get_db),
) -> ActionItemResponse:
    return await action_item_service.create_action_item(db, meeting_id, data)


@router.patch("/action-items/{item_id}", response_model=ActionItemResponse)
async def update_action_item(
    item_id: str,
    data: ActionItemUpdate,
    db: AsyncSession = Depends(get_db),
) -> ActionItemResponse:
    return await action_item_service.update_action_item(db, item_id, data)


@router.delete("/action-items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_action_item(
    item_id: str,
    db: AsyncSession = Depends(get_db),
) -> None:
    await action_item_service.delete_action_item(db, item_id)
