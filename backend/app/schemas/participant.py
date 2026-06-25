from typing import Optional

from pydantic import BaseModel, ConfigDict


class ParticipantCreateInput(BaseModel):
    name: str
    email: Optional[str] = None
    role: str = "attendee"
    speaker_label: Optional[str] = None


class ParticipantResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: Optional[str] = None
    role: str
    speaker_label: Optional[str] = None
