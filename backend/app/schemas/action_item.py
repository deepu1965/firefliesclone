from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class ActionItemCreate(BaseModel):
    description: str = Field(..., min_length=1)
    assignee_name: Optional[str] = None
    due_date: Optional[date] = None
    priority: str = Field("medium", pattern="^(low|medium|high)$")


class ActionItemUpdate(BaseModel):
    description: Optional[str] = Field(None, min_length=1)
    status: Optional[str] = Field(None, pattern="^(pending|in_progress|completed)$")
    assignee_name: Optional[str] = None
    due_date: Optional[date] = None
    priority: Optional[str] = Field(None, pattern="^(low|medium|high)$")


class ActionItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    external_id: str
    meeting_id: int
    assignee_name: Optional[str] = None
    description: str
    due_date: Optional[date] = None
    status: str
    priority: str
    created_at: datetime
    updated_at: datetime
