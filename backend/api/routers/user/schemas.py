import re
from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, Field, EmailStr, field_validator, ConfigDict


class UserInfo(BaseModel):
    id: UUID
    email: EmailStr = Field(description="Электронная почта")
    phone: str = Field(description="Номер телефона")
    username: str
    password_hash: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class UserUpdate(BaseModel):
    username: str
    password: str = Field(min_length=6, max_length=50, description="Пароль, от 6 до 50 знаков")
    phone: str