from pydantic import BaseModel, field_validator
from datetime import datetime
from typing import Optional


class EducationBase(BaseModel):
    id_user: int
    type: str
    direction: str
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None

    @field_validator('start_time', 'end_time')
    def remove_timezone(cls, value):
        if value and value.tzinfo:
            return value.replace(tzinfo=None)
        return value


class EducationCreate(EducationBase):
    pass


class EducationUpdate(BaseModel):
    type: Optional[str] = None
    direction: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None

    @field_validator('start_time', 'end_time' )
    def remove_timezone(cls, value):
        if value and value.tzinfo:
            return value.replace(tzinfo=None)
        return value


class EducationResponse(EducationBase):
    id: int

    class Config:
        from_attributes = True
