import re
from pydantic import BaseModel, Field, EmailStr, field_validator


class UserInfo(BaseModel):
    username: str
    email: EmailStr = Field(description="Электронная почта")
    phone: str
    password: str = Field(min_length=6, max_length=50, description="Пароль, от 6 до 50 знаков")


class UserCreate(BaseModel):
    username: str
    password: str = Field(min_length=6, max_length=50, description="Пароль, от 6 до 50 знаков")
    phone: str