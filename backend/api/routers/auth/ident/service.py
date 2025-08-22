from typing import Optional
from ..user.models import UserOrm
from .utils import verify_password
from ..user.service import UserRepository


class AuthRepository:
    @classmethod
    async def authenticate_user(cls, login: str, password: str) -> Optional[UserOrm]:
        """Authenticates a user by login and password.

        Args:
            login: The login of the user to authenticate.
            password: The password of the user to authenticate.

        Returns:
            A Optional[UserOrm], the user object if authentication is successful, otherwise None.
        """
        user = await UserRepository.find_one_or_none_by_login(login)
        if not user or verify_password(default_password=password, hashed_password=str(user.password)) is False:
            return None
        return user