from datetime import datetime
from typing import Optional
from sqlalchemy import DateTime, Enum, Text, func
from sqlalchemy.orm import Mapped, mapped_column
from database import Model
from routers.auth.user.roles import UserRole


class UserOrm(Model):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    login: Mapped[str] = mapped_column(unique=True, nullable=False)
    password: Mapped[str] = mapped_column(nullable=False)
    role: Mapped[Enum[UserRole]] = mapped_column(Enum(UserRole, name="user_role"), nullable=False, default=UserRole.user)
    about_me: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    create_date: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)
    update_time: Mapped[Optional[datetime]] = mapped_column(DateTime, onupdate=func.now())
