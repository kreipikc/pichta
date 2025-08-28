from fastapi import HTTPException, status, Depends
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from routers.for_myself.models import WantedProfession
from routers.for_myself.schemas import WantedProfessionCreate


class ForMyselfRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def created_wanted_profession(self, data: WantedProfessionCreate):
        try:
            wp = WantedProfession(
                id_user=data.user_id,
                id_profession=data.id_profession
            )
            self.session.add(wp)
            await self.session.commit()
        except IntegrityError:
            await self.session.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This profession is already in your wanted list"
            )


def get_for_myself_repository(db: AsyncSession = Depends(get_db)) -> ForMyselfRepository:
    """ Dependency для FastAPI """
    return ForMyselfRepository(db)