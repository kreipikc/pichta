from datetime import datetime
from sqlalchemy import String, Integer, TIMESTAMP, Column, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import Mapped, mapped_column
from database import Model


class TaskOrm(Model):
    __tablename__ = "tasks"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    id_user: Mapped[int] = mapped_column(Integer, nullable=False)
    title: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str] = mapped_column(String(500), nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="pending")
    start_time = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    end_time = Column(DateTime(timezone=True), nullable=True)
    created_from: Mapped[int] = mapped_column(Integer, nullable=False)
