from typing import Optional

from database import new_session
from .schemas import ChangePass
from .utils import verify_password, get_password_hash
from .responses.http_errors import HTTPError as HTTPError_auth
from ..user.models import UserOrm
from ..user.service import UserRepository
from ..user.responses.http_errors import HTTPError as HTTPError_user


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

    @classmethod
    async def update_pass_user(cls, user_id: int, data: ChangePass) -> None:
        async with new_session() as session:
            user = await session.get(UserOrm, user_id)
            if not user:
                raise HTTPError_user.user_not_found_404()

            if not verify_password(default_password=data.old_password, hashed_password=user.password):
                raise HTTPError_auth.bad_credentials_400()

            user.password = get_password_hash(data.new_password)

            session.add(user)
            await session.commit()