from pydantic import BaseModel, Field, EmailStr


class UserRegister(BaseModel):
    login: str = Field(..., min_length=3, max_length=50)
    password: str = Field(min_length=6, max_length=50, description="Пароль, от 6 до 50 знаков")


class UserLogin(BaseModel):
    login: str = Field(..., min_length=3, max_length=50)
    password: str = Field(min_length=6, max_length=50, description="Пароль, от 6 до 50 знаков")


class Token(BaseModel):
    access_token: str
    token_type: str