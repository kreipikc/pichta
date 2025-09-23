from datetime import datetime
from typing import Optional
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from database import new_session
from logger import app_logger
from .models import UserOrm
from .responses.http_errors import HTTPError as HTTPError_user
from .roles import UserRole
from .schemas import UserUpdate, AboutMeCreate, ChangePass
from ..ident.responses.http_errors import HTTPError as HTTPError_auth
from ..ident.schemas import UserRegister
from ..ident.utils import get_password_hash, verify_password


class UserRepository:
    @classmethod
    async def find_one_or_none_by_id(cls, id_user: int) -> Optional[UserOrm]:
        async with new_session() as session:
            user = await session.get(UserOrm, id_user)
            if user:
                return user
            return None

    @classmethod
    async def find_one_or_none_by_login(cls, login: str) -> Optional[UserOrm]:
        """Finds a user by login.

        Args:
            login: The login of the user to find.

        Returns:
            A Optional[UsersOrm], the user object if found, otherwise None.
        """
        async with new_session() as session:
            result = await session.execute(select(UserOrm).where(UserOrm.login == login))
            user = result.scalar_one_or_none()
            return user

    @classmethod
    async def create_user(cls, data: UserRegister, role: UserRole = UserRole.user) -> Optional[str]:
        """Create user.

        Args:
            data: The data for create user.
            role (UserRole): User role (default -> user).

        Returns:
            A Optional[str], login of the created user on success, otherwise None.
        """
        async with new_session() as session:
            try:
                user = UserOrm(
                    login=data.login,
                    password=get_password_hash(data.password),
                    role=role,
                    create_date=datetime.now()
                )

                session.add(user)
                await session.flush()
                await session.commit()
                return user.login
            except IntegrityError:
                await session.rollback()
                raise HTTPError_auth.login_already_exists_409()

    @classmethod
    async def update_user(cls, user_data: UserUpdate, id_user: int):
        async with new_session() as session:
            try:
                user = await cls.find_one_or_none_by_id(id_user)
                if not user:
                    raise HTTPError_user.user_not_found_404()

                for field, value in user_data.model_dump(exclude_unset=True).items():
                    if field == "password":
                        value = get_password_hash(value)
                    setattr(user, field, value)

                user.update_time = datetime.now()

                session.add(user)
                await session.commit()
            except IntegrityError:
                await session.rollback()
                raise HTTPError_auth.login_already_exists_409()

    @classmethod
    async def update_pass_user(cls, user_id: int, data: ChangePass):
        async with new_session() as session:
            result = await session.execute(
                select(UserOrm).where(UserOrm.id == user_id)
            )
            user = result.scalar_one_or_none()
            if not user:
                raise HTTPError_user.user_not_found_404()

            user.password = get_password_hash(data.password)

            session.add(user)
            await session.commit()

    @classmethod
    async def update_aboutme(cls, user_id: int, data: AboutMeCreate):
        async with new_session() as session:
            result = await session.execute(
                select(UserOrm).where(UserOrm.id == user_id)
            )
            user = result.scalar_one_or_none()

            if not user:
                raise HTTPError_user.user_not_found_404()

            # Обновляем информацию
            user.about_me = data.about_me
            await session.commit()