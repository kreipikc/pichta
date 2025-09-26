from typing import List

from fastapi import HTTPException, status, Depends
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload, joinedload

from database import get_db
from logger import app_logger
from routers.for_myself.models import WantedProfession
from routers.for_myself.schemas import WantedProfessionCreate


class ForMyselfRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_wanted_professions_by_user_id(self, user_id: int):
        prof_list = await self.session.execute(
            select(WantedProfession)
            .where(WantedProfession.id_user == user_id)
            .options(joinedload(WantedProfession.profession))
        )

        return prof_list.scalars().all()

    async def create_wanted_professions(self, user_id: int, professions_data: List[WantedProfessionCreate]):
        try:
            professions = [
                WantedProfession(
                    id_user=user_id,
                    id_profession=prof.id_profession
                )
                for prof in professions_data
            ]

            self.session.add_all(professions)
            await self.session.commit()
        except IntegrityError:
            await self.session.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="One or more professions are already in your wanted list"
            )


def get_for_myself_repository(db: AsyncSession = Depends(get_db)) -> ForMyselfRepository:
    """ Dependency для FastAPI """
    return ForMyselfRepository(db)