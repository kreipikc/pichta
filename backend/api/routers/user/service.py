import uuid
from datetime import datetime
from typing import Optional
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from database import new_session
from .models import UserOrm
from .responses.http_errors import HTTPError as HTTPError_user
from .schemas import UserUpdate
from ..auth.responses.http_errors import HTTPError as HTTPError_auth
from ..auth.schemas import UserRegister


class UserRepository:
    @classmethod
    async def find_one_or_none_by_email(cls, email: str) -> Optional[UserOrm]:
        """Finds a user by email.

        Args:
            email: The email of the user to find.

        Returns:
            A Optional[UsersOrm], the user object if found, otherwise None.
        """
        async with new_session() as session:
            result = await session.execute(select(UserOrm).where(UserOrm.email == email))
            user = result.scalar_one_or_none()
            return user

    @classmethod
    async def find_one_or_none_by_phone(cls, phone: str) -> Optional[UserOrm]:
        """Finds a user by phone.

        Args:
            phone: The phone of the user to find.

        Returns:
            A Optional[UsersOrm], the user object if found, otherwise None.
        """
        async with new_session() as session:
            result = await session.execute(select(UserOrm).where(UserOrm.phone == phone))
            user = result.scalar_one_or_none()
            return user

    @classmethod
    async def create_user(cls, data: UserRegister) -> Optional[str]:
        """Create user.

        Args:
            data: The data for create user.

        Returns:
            A Optional[str], email of the created user on success, otherwise None.
        """
        async with new_session() as session:
            try:
                user = UserOrm(
                    email=data.email,
                    phone=data.phone,
                    username=data.username,
                    password_hash=data.password,
                    created_at=datetime.now()
                )

                session.add(user)
                await session.flush()
                await session.commit()
                return user.email
            except IntegrityError:
                await session.rollback()
                raise HTTPError_auth.email_or_phone_already_exists_409()

    @classmethod
    async def update_user(cls, user_data: UserUpdate, id_user: uuid.UUID):
        async with new_session() as session:
            try:
                user = await session.get(UserOrm, id_user)
                if not user:
                    raise HTTPError_user.user_not_found_404()

                for field, value in user_data.model_dump(exclude_unset=True).items():
                    setattr(user, field, value)

                user.updated_at = datetime.now()

                await session.commit()
            except IntegrityError:
                await session.rollback()
                raise HTTPError_auth.email_or_phone_already_exists_409()