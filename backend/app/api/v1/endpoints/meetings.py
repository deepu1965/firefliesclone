from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.schemas.meeting import MeetingCreate, MeetingListResponse, MeetingResponse, MeetingUpdate
from app.schemas.participant import ParticipantResponse
from app.services.meeting_service import meeting_service

router = APIRouter(prefix="/meetings", tags=["meetings"])


@router.get("", response_model=MeetingListResponse)
async def list_meetings(
    q: Optional[str] = Query(None, description="Search by title or participant"),
    date_from: Optional[datetime] = Query(None),
    date_to: Optional[datetime] = Query(None),
    participant: Optional[str] = Query(None, description="Filter by participant name"),
    sort: str = Query("recent", description="Sort order: recent | name | date_asc"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
) -> MeetingListResponse:
    return await meeting_service.list_meetings(
        db,
        q=q,
        date_from=date_from,
        date_to=date_to,
        participant=participant,
        sort_by=sort,
        page=page,
        page_size=page_size,
    )


@router.post("", response_model=MeetingResponse, status_code=status.HTTP_201_CREATED)
async def create_meeting(
    data: MeetingCreate,
    db: AsyncSession = Depends(get_db),
) -> MeetingResponse:
    return await meeting_service.create_meeting(db, data)


@router.get("/{meeting_id}", response_model=MeetingResponse)
async def get_meeting(
    meeting_id: str,
    db: AsyncSession = Depends(get_db),
) -> MeetingResponse:
    return await meeting_service.get_meeting(db, meeting_id)


@router.patch("/{meeting_id}", response_model=MeetingResponse)
async def update_meeting(
    meeting_id: str,
    data: MeetingUpdate,
    db: AsyncSession = Depends(get_db),
) -> MeetingResponse:
    return await meeting_service.update_meeting(db, meeting_id, data)


@router.delete("/{meeting_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_meeting(
    meeting_id: str,
    db: AsyncSession = Depends(get_db),
) -> None:
    await meeting_service.delete_meeting(db, meeting_id)


@router.get("/{meeting_id}/participants", response_model=list[ParticipantResponse])
async def list_participants(
    meeting_id: str,
    db: AsyncSession = Depends(get_db),
) -> list[ParticipantResponse]:
    return await meeting_service.get_participants(db, meeting_id)
