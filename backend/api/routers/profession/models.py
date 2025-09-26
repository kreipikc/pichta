from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

from database import Model


class Profession(Model):
    __tablename__ = 'professions'

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    lvl = Column(String(50), default="jun")

    wanted_professions = relationship("WantedProfession", back_populates="profession")