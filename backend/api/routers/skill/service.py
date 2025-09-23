from typing import List

from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException, status, Depends

from logger import app_logger
from .models import Skill, UserSkill
from .schemas import UserSkillCreate
from database import get_db


class SkillRepository:
    def __init__(self, session: AsyncSession = Depends(get_db)):
        self.session = session

    async def get_user_skills(self, user_id: int) -> list[UserSkill]:
        result = await self.session.execute(
            select(UserSkill).where(UserSkill.id_user == user_id))
        return result.scalars().all()

    async def get_user_skill(self, skill_id: int, user_id: int) -> UserSkill | None:
        result = await self.session.execute(
            select(UserSkill)
            .where(UserSkill.id_skill == skill_id)
            .where(UserSkill.id_user == user_id))
        return result.scalar_one_or_none()

    async def create_user_skills(self, user_id: int, skill_data: List[UserSkillCreate]) -> List[UserSkill]:
        try:
            skills = []
            for skill in skill_data:
                skill_dict = skill.model_dump()

                # Преобразуем aware datetime в naive datetime
                if skill_dict.get('start_date'):
                    skill_dict['start_date'] = skill_dict['start_date'].replace(tzinfo=None)
                if skill_dict.get('end_date'):
                    skill_dict['end_date'] = skill_dict['end_date'].replace(tzinfo=None)

                skills.append(UserSkill(id_user=user_id, **skill_dict))

            self.session.add_all(skills)
            await self.session.commit()

            for skill in skills:
                await self.session.refresh(skill)
            return skills

        except IntegrityError as e:
            await self.session.rollback()
            app_logger.error(f"IntegrityError: {e}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Skill already exists for this user or invalid foreign key"
            )
        except Exception as e:
            await self.session.rollback()
            app_logger.error(f"Error: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Internal server error"
            )

    async def update_user_skill(self, skill_id: int, user_id: int, skill_data: UserSkillCreate) -> UserSkill:
        try:
            skill = await self.get_user_skill(skill_id, user_id)
            if not skill:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Skill not found for this user"
                )

            update_data = skill_data.model_dump()

            if 'start_date' in update_data and update_data['start_date']:
                if update_data['start_date'].tzinfo is not None:
                    update_data['start_date'] = update_data['start_date'].replace(tzinfo=None)

            if 'end_date' in update_data and update_data['end_date']:
                if update_data['end_date'].tzinfo is not None:
                    update_data['end_date'] = update_data['end_date'].replace(tzinfo=None)

            for key, value in update_data.items():
                setattr(skill, key, value)

            await self.session.commit()
            await self.session.refresh(skill)
            return skill
        except Exception as e:
            await self.session.rollback()
            app_logger.error(f"Error: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Internal server error"
            )

    async def delete_user_skill(self, skill_id: int, user_id: int) -> None:
        try:
            skill = await self.get_user_skill(skill_id, user_id)
            if not skill:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Skill not found for this user"
                )

            await self.session.delete(skill)
            await self.session.commit()
        except Exception as e:
            await self.session.rollback()
            app_logger.error(f"Error: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Internal server error"
            )


def get_skill_repository(db: AsyncSession = Depends(get_db)) -> SkillRepository:
    """ Dependency для FastAPI """
    return SkillRepository(db)