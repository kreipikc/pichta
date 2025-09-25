from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException, status, Depends
from .models import WorkExperience
from .schemas import ExperienceUpdate, ExperienceCreate, ExperienceResponse
from database import get_db


class ExperienceRepository:
    def __init__(self, session: AsyncSession = Depends(get_db)):
        self.session = session

    async def get_all_experience(self) -> list[WorkExperience]:
        exp_list = await self.session.execute(select(WorkExperience))
        return exp_list.scalars().all()

    async def create_experience_for_self(self, user_id: int, experience_data: ExperienceCreate) -> ExperienceResponse:
        try:
            experience_dict = experience_data.model_dump()
            experience = WorkExperience(
                id_user=user_id,
                **experience_dict
            )
            self.session.add(experience)
            await self.session.commit()
            await self.session.refresh(experience)
            return ExperienceResponse.model_validate(experience)
        except Exception as e:
            await self.session.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error creating experience: {str(e)}"
            )

    async def get_user_experiences(self, user_id: int) -> list[ExperienceResponse]:
        result = await self.session.execute(
            select(WorkExperience).where(WorkExperience.id_user == user_id))
        experiences = result.scalars().all()
        return [ExperienceResponse.model_validate(exp) for exp in experiences]

    async def get_experience(self, experience_id: int) -> ExperienceResponse | None:
        result = await self.session.execute(
            select(WorkExperience).where(WorkExperience.id == experience_id))
        experience = result.scalar_one_or_none()
        return ExperienceResponse.model_validate(experience) if experience else None

    async def create_experience(self, experience_data: ExperienceCreate, user_id: int) -> ExperienceResponse:
        try:
            experience_dict = experience_data.model_dump()
            experience = WorkExperience(
                id_user=user_id,
                **experience_dict
            )
            self.session.add(experience)
            await self.session.commit()
            await self.session.refresh(experience)
            return ExperienceResponse.model_validate(experience)
        except Exception as e:
            await self.session.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error creating experience: {str(e)}"
            )

    async def update_experience(self, experience_id: int, experience_data: ExperienceUpdate) -> ExperienceResponse:
        try:
            result = await self.session.execute(
                select(WorkExperience).where(WorkExperience.id == experience_id))
            experience = result.scalar_one_or_none()

            if not experience:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Experience not found"
                )

            update_data = experience_data.model_dump(exclude_unset=True)
            for key, value in update_data.items():
                setattr(experience, key, value)

            await self.session.commit()
            await self.session.refresh(experience)
            return ExperienceResponse.model_validate(experience)
        except Exception as e:
            await self.session.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error updating experience: {str(e)}"
            )

    async def delete_experience(self, experience_id: int) -> None:
        try:
            result = await self.session.execute(
                select(WorkExperience).where(WorkExperience.id == experience_id))
            experience = result.scalar_one_or_none()

            if not experience:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Experience not found"
                )

            await self.session.delete(experience)
            await self.session.commit()
        except Exception as e:
            await self.session.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error deleting experience: {str(e)}"
            )

def get_experience_repository(db: AsyncSession = Depends(get_db)) -> ExperienceRepository:
    """ Dependency для FastAPI """
    return ExperienceRepository(db)