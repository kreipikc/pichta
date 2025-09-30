from sqlalchemy import Integer, Column, String

from database import Model


class Course(Model):
    __tablename__ = 'courses'

    id = Column(Integer, primary_key=True)
    url = Column(String(500), unique=True, nullable=False)