from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel

from routers.skill.enums import UserSkillStatus


class UserSkillBody(BaseModel):
    proficiency: int
    priority: Optional[int] = None
    start_date: datetime
    end_date: Optional[datetime]
    status: UserSkillStatus


class NodeSkill(BaseModel):
    name: str
    count: int


class SkillsProfForGanttGraph(BaseModel):
    process: List[UserSkillBody]
    inactive: List[UserSkillBody]
    complete: List[UserSkillBody]
    gray_zone: List[NodeSkill]
