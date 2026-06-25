from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.schemas.search import SearchResponse
from app.services.search_service import search_service

router = APIRouter(tags=["search"])


@router.get("/search", response_model=SearchResponse)
async def global_search(
    q: str = Query(..., min_length=1, description="Search query"),
    type: Optional[str] = Query(
        "all",
        pattern="^(all|meetings|transcripts)$",
        description="Result type filter",
    ),
    limit: int = Query(30, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
) -> SearchResponse:
    return await search_service.global_search(db, query=q, search_type=type or "all", limit=limit)
