from pydantic import BaseModel
from datetime import datetime
from typing import Optional

from routers.skill.enums import UserSkillStatus


class UserSkillBase(BaseModel):
    id_skill: int
    id_user: int
    proficiency: int
    priority: Optional[int] = None
    start_date: datetime
    end_date: datetime
    status: UserSkillStatus


class UserSkillCreate(BaseModel):
    id_skill: int
    proficiency: int
    priority: Optional[int] = None
    start_date: datetime
    end_date: datetime
    status: UserSkillStatus


class UserSkillUpdate(BaseModel):
    proficiency: Optional[int] = None
    priority: Optional[int] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    status: Optional[UserSkillStatus] = None


class UserSkillResponse(UserSkillBase):
    class Config:
        from_attributes = True


class SkillResponse(UserSkillBase):
    name: str

    class Config:
        from_attributes = True


class SkillOnlyResponse(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True


class CourseResponse(BaseModel):
    id: int
    url: str