# schemas.py
from pydantic import BaseModel

class WantedProfessionCreate(BaseModel):
    id_profession: int
    user_id: int
