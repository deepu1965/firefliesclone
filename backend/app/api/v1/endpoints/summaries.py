from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.schemas.summary import SummaryResponse
from app.services.summary_service import summary_service

router = APIRouter(tags=["summaries"])


@router.get("/meetings/{meeting_id}/summary", response_model=SummaryResponse)
async def get_summary(
    meeting_id: str,
    db: AsyncSession = Depends(get_db),
) -> SummaryResponse:
    return await summary_service.get_summary(db, meeting_id)


@router.post("/meetings/{meeting_id}/summary/generate", response_model=SummaryResponse)
async def generate_summary(
    meeting_id: str,
    db: AsyncSession = Depends(get_db),
) -> SummaryResponse:
    return await summary_service.generate_summary(db, meeting_id)
