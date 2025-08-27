from database import Model
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum


class Skill(Model):
    __tablename__ = 'skills'

    id = Column(Integer, primary_key=True)
    name = Column(String(50), unique=True, nullable=False)


# Связь пользователей и навыков
class UserSkill(Model):
    __tablename__ = 'user_skills'

    id_skill = Column(Integer, ForeignKey('skills.id'), primary_key=True)
    id_user = Column(Integer, ForeignKey('users.id'), primary_key=True)
    proficiency = Column(Integer, nullable=False)
    priority = Column(Integer)
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    status = Column(String(20), nullable=False)