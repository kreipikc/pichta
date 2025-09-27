from database import Model
from sqlalchemy import Column, Integer, String, DateTime, func


class WorkExperience(Model):
    __tablename__ = 'work_experience'

    id = Column(Integer, primary_key=True)
    id_user = Column(Integer, nullable=False)
    title = Column(String(100), nullable=False)
    id_profession = Column(Integer)
    description = Column(String(500))
    start_time = Column(DateTime(timezone=False), nullable=False)  # Без временной зоны
    end_time = Column(DateTime(timezone=False))  # Без временной зоны