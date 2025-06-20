from pydantic import BaseModel, Field, EmailStr


class UserRegister(BaseModel):
    email: EmailStr = Field(description="Электронная почта")
    phone: str = Field(description="Номер телефона")
    username: str = Field(description="Username")
    password: str = Field(min_length=6, max_length=50, description="Пароль, от 6 до 50 знаков")


class UserLogin(BaseModel):
    email: EmailStr = Field(description="Электронная почта")
    password: str = Field(min_length=6, max_length=50, description="Пароль, от 6 до 50 знаков")


class Token(BaseModel):
    access_token: str
    token_type: str