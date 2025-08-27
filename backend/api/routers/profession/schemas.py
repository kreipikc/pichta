from pydantic import BaseModel
from typing import Optional


class ProfessionBase(BaseModel):
    name: str
    lvl: Optional[str] = None


class ProfessionCreate(ProfessionBase):
    pass


class ProfessionUpdate(BaseModel):
    name: Optional[str] = None
    lvl: Optional[str] = None


class ProfessionResponse(ProfessionBase):
    id: int

    class Config:
        from_attributes = True