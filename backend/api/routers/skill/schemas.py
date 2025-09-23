from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class UserSkillBase(BaseModel):
    id_skill: int
    id_user: int
    proficiency: int
    priority: Optional[int] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    status: str


class UserSkillCreate(BaseModel):
    id_skill: int
    proficiency: int
    priority: Optional[int] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    status: str


class UserSkillUpdate(BaseModel):
    proficiency: int
    priority: Optional[int] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    status: str


class UserSkillResponse(UserSkillBase):
    class Config:
        from_attributes = True


class SkillResponse(UserSkillBase):
    name: str

    class Config:
        from_attributes = True