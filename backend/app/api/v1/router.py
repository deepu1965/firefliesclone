from fastapi import APIRouter

from app.api.v1.endpoints import (
    action_items,
    meetings,
    search,
    summaries,
    topics,
    transcripts,
)

router = APIRouter()

router.include_router(meetings.router)
router.include_router(transcripts.router)
router.include_router(summaries.router)
router.include_router(action_items.router)
router.include_router(topics.router)
router.include_router(search.router)
