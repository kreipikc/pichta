from pydantic import BaseModel
from typing import Optional


class ProfessionBase(BaseModel):
    name: str


class ProfessionCreate(ProfessionBase):
    pass


class ProfessionUpdate(BaseModel):
    name: Optional[str] = None


class ProfessionRead(ProfessionBase):
    id: int

    class Config:
        from_attributes = True