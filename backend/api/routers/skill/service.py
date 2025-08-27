from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException, status, Depends
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

    async def create_user_skill(self, skill_data: UserSkillCreate) -> UserSkill:
        try:
            skill = UserSkill(**skill_data.model_dump())
            self.session.add(skill)
            await self.session.commit()
            await self.session.refresh(skill)
            return skill
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error: {e}")

    async def update_user_skill(self, skill_id: int, user_id: int, skill_data: UserSkillCreate) -> UserSkill:
        skill = await self.get_user_skill(skill_id, user_id)
        if not skill:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Skill not found for this user"
            )

        for key, value in skill_data.model_dump().items():
            setattr(skill, key, value)

        await self.session.commit()
        await self.session.refresh(skill)
        return skill

    async def delete_user_skill(self, skill_id: int, user_id: int) -> None:
        skill = await self.get_user_skill(skill_id, user_id)
        if not skill:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Skill not found for this user"
            )

        await self.session.delete(skill)
        await self.session.commit()


def get_skill_repository(db: AsyncSession = Depends(get_db)) -> SkillRepository:
    """ Dependency для FastAPI """
    return SkillRepository(db)