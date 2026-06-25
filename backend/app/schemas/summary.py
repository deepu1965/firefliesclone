from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class SummaryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    meeting_id: int
    overview: Optional[str] = None
    key_points: Optional[list[str]] = None
    next_steps: Optional[list[str]] = None
    generated_by: str
    generated_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
