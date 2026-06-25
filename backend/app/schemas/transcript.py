from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class TranscriptSegmentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    speaker_name: str
    start_time_ms: int
    end_time_ms: int
    text: str
    sequence_index: int


class TranscriptResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    meeting_id: int
    source: str
    created_at: datetime
    segments: list[TranscriptSegmentResponse] = []
    total_segments: int = 0
