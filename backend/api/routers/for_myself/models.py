from sqlalchemy import Column, ForeignKey, Integer
from sqlalchemy.orm import relationship

from database import Model
from ..profession.models import Profession


class WantedProfession(Model):
    __tablename__ = 'wanted_profession'

    id_user = Column(Integer, primary_key=True)
    id_profession = Column(Integer, ForeignKey("professions.id"), primary_key=True)

    profession = relationship("Profession", back_populates="wanted_professions")
