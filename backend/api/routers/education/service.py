from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import HTTPException, status, Depends

from database import get_db
from .models import Education
from .schemas import EducationCreate, EducationUpdate, EducationResponse
from routers.auth.user.models import UserOrm


class EducationRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_all_education(self) -> list[Education]:
        result = await self.session.execute(select(Education))
        return result.scalars().all()

    async def get_education_by_user(self, user_id: int) -> list[Education]:
        query = select(Education).where(Education.id_user == user_id)
        result = await self.session.execute(query)
        return result.scalars().all()

    async def get_education_by_id(self, education_id: int) -> Optional[Education]:
        result = await self.session.execute(select(Education).where(Education.id == education_id))
        return result.scalar_one_or_none()

    async def create_education(self, education: EducationCreate) -> EducationResponse:
        try:
            # Проверяем существование пользователя
            user = await self.session.get(UserOrm, education.id_user)
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"User with id {education.id_user} does not exist"
                )
            # Преобразуем данные и удаляем временные зоны
            education_data = education.model_dump()
            if education_data.get('start_time') and education_data['start_time'].tzinfo:
                education_data['start_time'] = education_data['start_time'].replace(tzinfo=None)
            if education_data.get('end_time') and education_data['end_time'].tzinfo:
                education_data['end_time'] = education_data['end_time'].replace(tzinfo=None)

            # Создаем и сохраняем запись
            db_education = Education(**education_data)
            self.session.add(db_education)
            await self.session.commit()
            await self.session.refresh(db_education)

            # Проверяем, что ID был получен
            if db_education.id is None:
                raise ValueError("Failed to get ID for new education record")

            return EducationResponse.model_validate(db_education)

        except Exception as e:
            await self.session.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error creating education record: {str(e)}"
            )

    async def update_education(self, education_id: int, education: EducationUpdate) -> EducationResponse:
        db_education = await self.get_education_by_id(education_id)

        if not db_education:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Education record not found"
            )

        update_data = education.model_dump(exclude_unset=True)

        # Обработка временных зон
        if 'start_time' in update_data and update_data['start_time']:
            update_data['start_time'] = update_data['start_time'].replace(tzinfo=None)
        if 'end_time' in update_data and update_data['end_time']:
            update_data['end_time'] = update_data['end_time'].replace(tzinfo=None)

        for field, value in update_data.items():
            setattr(db_education, field, value)

        await self.session.commit()
        await self.session.refresh(db_education)
        return EducationResponse.model_validate(db_education)

    async def delete_education(self, education_id: int) -> None:
        db_education = await self.get_education_by_id(education_id)
        if not db_education:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Education record not found"
            )

        await self.session.delete(db_education)
        await self.session.commit()


def get_education_repository(db: AsyncSession = Depends(get_db)) -> EducationRepository:
    """ Dependency для FastAPI """
    return EducationRepository(db)