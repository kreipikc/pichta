from sqlalchemy import Column, ForeignKey, Integer
from database import Model


class WantedProfession(Model):
    __tablename__ = 'wanted_profession'

    id_user = Column(Integer, primary_key=True)
    id_profession = Column(Integer, primary_key=True)
