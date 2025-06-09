from typing import Optional
from pydantic import EmailStr
from ..user.models import UserOrm
from .utils import verify_password
from ..user.service import UserRepository


class AuthRepository:
    @classmethod
    async def authenticate_user(cls, email: EmailStr, password: str) -> Optional[UserOrm]:
        """Authenticates a user by email and password.

        Args:
            email: The email of the user to authenticate.
            password: The password of the user to authenticate.

        Returns:
            A Optional[UserOrm], the user object if authentication is successful, otherwise None.
        """
        user = await UserRepository.find_one_or_none_by_email(str(email))
        if not user or verify_password(default_password=password, hashed_password=str(user.password_hash)) is False:
            return None
        return user