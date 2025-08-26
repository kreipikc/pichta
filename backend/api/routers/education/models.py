from sqlalchemy import Column, String, DateTime, Integer
from database import Model
from sqlalchemy.sql import func


class Education(Model):
    __tablename__ = 'education'

    id = Column(Integer, primary_key=True)
    id_user = Column(Integer, nullable=False)
    type = Column(String(100), nullable=False)
    direction = Column(String(100), nullable=False)
    start_time = Column(DateTime(timezone=False), server_default=func.now(), nullable=False)
    end_time = Column(DateTime(timezone=False), nullable=True)