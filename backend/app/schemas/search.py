from typing import Optional

from pydantic import BaseModel


class TranscriptSearchResult(BaseModel):
    segment_id: int
    speaker_name: str
    start_time_ms: int
    end_time_ms: int
    highlighted_text: str
    sequence_index: int


class TranscriptSearchResponse(BaseModel):
    query: str
    total: int
    results: list[TranscriptSearchResult]


class GlobalSearchResult(BaseModel):
    result_type: str
    meeting_external_id: str
    meeting_title: str
    segment_id: Optional[int] = None
    speaker_name: Optional[str] = None
    start_time_ms: Optional[int] = None
    text: str
    score: float


class SearchResponse(BaseModel):
    query: str
    total: int
    results: list[GlobalSearchResult]
