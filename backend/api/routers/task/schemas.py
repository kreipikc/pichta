from pydantic import BaseModel, Field
from datetime import datetime, timezone
from typing import Optional
from pydantic import validator


class TaskCreateSelf(BaseModel):
    title: str = Field(..., max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    status: str = Field("pending", max_length=20)
    end_time: Optional[datetime] = None
    created_from: int

    start_time: Optional[datetime] = None

    @validator('start_time')
    def validate_start_time(cls, v):
        if v and v.tzinfo is None:
            return v.replace(tzinfo=timezone.utc)
        return v


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = Field(None, max_length=500)
    status: Optional[str] = Field("pending", max_length=20)
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None


class TaskBase(BaseModel):
    title: str = Field(..., max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    status: str = Field("pending", max_length=20)
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None


class TaskCreate(TaskBase):
    pass


class TaskResponse(TaskBase):
    id: int
    id_user: int
    created_from: int

    class Config:
        from_attributes = True