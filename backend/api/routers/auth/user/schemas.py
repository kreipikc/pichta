from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict

from routers.auth.user.roles import UserRole


class UserInfo(BaseModel):
    id: int
    login: str
    role: UserRole
    about_me: Optional[str] = Field(None, max_length=1000)
    password: str
    create_date: datetime
    update_time: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class UserUpdate(BaseModel):
    login: str
    password: str = Field(min_length=6, max_length=50, description="Пароль, от 6 до 50 знаков")
    about_me: Optional[str] = Field(None, max_length=1000)