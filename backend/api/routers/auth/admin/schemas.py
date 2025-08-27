from typing import Optional
from pydantic import BaseModel
from ..user.roles import UserRole


class UserUpdate(BaseModel):
    login: Optional[str] = None
    about_me: Optional[str] = None
    password: Optional[str] = None
    role: Optional[UserRole] = None