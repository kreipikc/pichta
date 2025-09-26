# schemas.py
from pydantic import BaseModel
from routers.profession.schemas import ProfessionRead


class WantedProfessionCreate(BaseModel):
    id_profession: int


class WantedProfessionRead(BaseModel):
    id_user: int
    id_profession: int
    profession: ProfessionRead

    class Config:
        from_attributes = True