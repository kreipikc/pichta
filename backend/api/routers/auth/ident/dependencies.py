from typing import List, Callable, Optional

from fastapi import Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from .jwt import JWTService
from .responses.http_errors import HTTPError
from ..user.roles import UserRole
from ..user.schemas import UserInfo


http_bearer = HTTPBearer()


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(http_bearer)) -> UserInfo:
    """Retrieves the current user based on the provided JWT token.

    Args:
        credentials (HTTPAuthorizationCredentials): The HTTP authorization credentials containing the JWT token.

    Returns:
        UserInfo: The user object corresponding to the valid JWT token.
    """
    token = credentials.credentials

    user = await JWTService.descript_and_check_token(token)

    return UserInfo.model_validate(user.__dict__)


def require_roles(req_roles: List[UserRole]) -> Callable[[UserInfo], UserInfo]:
    """Function for checking the presence of roles from the list

    Args:
        req_roles (List[UserRole]): Required roles for verification

    Returns:
        UserInfo: The user object (if there is at least 1 role from the list)
    """
    def dependency(user: UserInfo = Depends(get_current_user)) -> Optional[UserInfo]:
        if user.role not in req_roles:
            raise HTTPError.no_access_rights_403()
        return user
    return dependency
