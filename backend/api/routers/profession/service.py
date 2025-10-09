from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import HTTPException, status, Depends

from database import get_db
from .models import Profession
from .schemas import ProfessionCreate, ProfessionUpdate, ProfessionRead


class ProfessionRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_all_professions(self) -> list[Profession]:
        result = await self.session.execute(select(Profession))
        return result.scalars().all()

    async def get_profession_by_id(self, profession_id: int) -> Profession | None:
        result = await self.session.execute(select(Profession).where(Profession.id == profession_id))
        return result.scalar_one_or_none()

    async def create_profession(self, profession: ProfessionCreate) -> ProfessionRead:
        try:
            db_profession = Profession(**profession.model_dump())
            self.session.add(db_profession)
            await self.session.commit()
            await self.session.refresh(db_profession)
            return ProfessionRead.model_validate(db_profession)
        except Exception as e:
            await self.session.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error creating profession: {str(e)}"
            )

    async def update_profession(self, profession_id: int, profession: ProfessionUpdate) -> ProfessionRead:
        db_profession = await self.get_profession_by_id(profession_id)
        if not db_profession:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Profession not found"
            )

        update_data = profession.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_profession, field, value)

        await self.session.commit()
        await self.session.refresh(db_profession)
        return ProfessionRead.model_validate(db_profession)

    async def delete_profession(self, profession_id: int) -> None:
        db_profession = await self.get_profession_by_id(profession_id)
        if not db_profession:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Profession not found"
            )

        await self.session.delete(db_profession)
        await self.session.commit()


def get_profession_repository(db: AsyncSession = Depends(get_db)) -> ProfessionRepository:
    """ Dependency для FastAPI """
    return ProfessionRepository(db)