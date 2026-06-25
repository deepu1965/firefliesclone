from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.common import PaginatedResponse
from app.schemas.participant import ParticipantCreateInput, ParticipantResponse


class MeetingCreate(BaseModel):
    title: str = Field(..., min_length=1)
    started_at: Optional[datetime] = None
    duration_seconds: Optional[int] = Field(None, ge=0)
    audio_url: Optional[str] = None
    meeting_url: Optional[str] = None
    participants: list[ParticipantCreateInput] = []
    transcript_text: Optional[str] = None


class MeetingUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1)
    started_at: Optional[datetime] = None
    duration_seconds: Optional[int] = Field(None, ge=0)
    audio_url: Optional[str] = None
    meeting_url: Optional[str] = None


class MeetingListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    external_id: str
    title: str
    started_at: Optional[datetime] = None
    duration_seconds: Optional[int] = None
    status: str
    audio_url: Optional[str] = None
    created_at: datetime
    participants: list[ParticipantResponse] = []
    summary_preview: Optional[list[str]] = None


class MeetingListResponse(PaginatedResponse[MeetingListItem]):
    pass


class MeetingResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    external_id: str
    title: str
    started_at: Optional[datetime] = None
    ended_at: Optional[datetime] = None
    duration_seconds: Optional[int] = None
    status: str
    audio_url: Optional[str] = None
    meeting_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    participants: list[ParticipantResponse] = []
