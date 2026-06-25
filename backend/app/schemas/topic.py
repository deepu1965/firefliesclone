from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class TopicResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    start_time_ms: Optional[int] = None
    end_time_ms: Optional[int] = None
    sequence_index: int
    created_at: datetime
