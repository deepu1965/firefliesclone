from typing import Optional

from fastapi import APIRouter, Depends, File, Form, Query, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.schemas.search import TranscriptSearchResponse
from app.schemas.transcript import TranscriptResponse
from app.services.transcript_service import transcript_service

router = APIRouter(tags=["transcripts"])


@router.get("/meetings/{meeting_id}/transcript", response_model=TranscriptResponse)
async def get_transcript(
    meeting_id: str,
    db: AsyncSession = Depends(get_db),
) -> TranscriptResponse:
    return await transcript_service.get_transcript(db, meeting_id)


@router.post(
    "/meetings/{meeting_id}/transcript",
    response_model=TranscriptResponse,
    status_code=status.HTTP_201_CREATED,
)
async def upload_transcript(
    meeting_id: str,
    raw_text: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    db: AsyncSession = Depends(get_db),
) -> TranscriptResponse:
    file_content: Optional[bytes] = None
    filename: Optional[str] = None
    if file:
        file_content = await file.read()
        filename = file.filename

    return await transcript_service.create_transcript(
        db,
        meeting_external_id=meeting_id,
        raw_text=raw_text,
        file_content=file_content,
        filename=filename,
    )


@router.get("/meetings/{meeting_id}/transcript/search", response_model=TranscriptSearchResponse)
async def search_transcript(
    meeting_id: str,
    q: str = Query(..., min_length=1, description="Search query"),
    limit: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
) -> TranscriptSearchResponse:
    return await transcript_service.search_transcript(db, meeting_id, query=q, limit=limit)


@router.get("/meetings/{meeting_id}/search", response_model=TranscriptSearchResponse)
async def search_meeting_transcript(
    meeting_id: str,
    q: str = Query(..., min_length=1, description="Search query"),
    limit: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
) -> TranscriptSearchResponse:
    return await transcript_service.search_transcript(db, meeting_id, query=q, limit=limit)
