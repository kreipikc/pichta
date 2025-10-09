from pydantic import BaseModel, field_validator
from datetime import datetime
from typing import Optional


class ExperienceBase(BaseModel):
    title: str
    id_profession: Optional[int] = None
    description: Optional[str] = None
    start_time: datetime
    end_time: Optional[datetime] = None

    @field_validator('start_time', 'end_time')
    def remove_timezone(cls, value):
        if value and value.tzinfo:
            return value.replace(tzinfo=None)
        return value


class ExperienceCreate(ExperienceBase):
    pass


class ExperienceUpdate(BaseModel):
    title: Optional[str] = None
    id_profession: Optional[int] = None
    description: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None


class ExperienceResponse(ExperienceBase):
    id: int
    id_user: int

    class Config:
        from_attributes = True
