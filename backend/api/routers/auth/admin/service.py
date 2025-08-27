from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException, status, Depends
from datetime import datetime

from database import get_db
from routers.auth.user.models import UserOrm
from routers.auth.user.roles import UserRole


class AdminRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_all_users(self):
        result = await self.session.execute(select(UserOrm))
        users = result.scalars().all()
        return users

    async def delete_user(self, user_id: int):
        try:
            user_id = int(user_id)
        except (ValueError, TypeError):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User ID must be a valid integer"
            )

        stmt = select(UserOrm).where(UserOrm.id == user_id)
        user = (await self.session.execute(stmt)).scalar_one_or_none()

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        await self.session.delete(user)
        await self.session.commit()

    async def update_user(self, user_id: int, user_data: dict):
        user = await self.session.get(UserOrm, user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        for key, value in user_data.items():
            if value is not None:
                if key == 'role' and isinstance(value, str):
                    value = UserRole(value)
                setattr(user, key, value)

        user.update_time = datetime.utcnow()
        await self.session.commit()
        await self.sessionrefresh(user)
        return user


def get_admin_repository(db: AsyncSession = Depends(get_db)) -> AdminRepository:
    """ Dependency для FastAPI """
    return AdminRepository(db)