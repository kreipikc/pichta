from fastapi import Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt, ExpiredSignatureError
from config import SECRET_KEY_JWT, ALGORITHM
from .responses.http_errors import HTTPError
from ..user.schemas import UserInfo
from ..user.models import UserOrm
from .utils import create_access_token
from ..user.service import UserRepository


http_bearer = HTTPBearer()


async def descript_and_check_token(token: str) -> UserOrm:
    try:
        payload = jwt.decode(token, SECRET_KEY_JWT, algorithms=[ALGORITHM])
    except ExpiredSignatureError:
        raise HTTPError.bad_credentials_403()
    except JWTError:
        raise HTTPError.invalid_token_401()

    user_email = payload.get('sub')
    if not user_email:
        raise HTTPError.invalid_token_401()

    user = await UserRepository.find_one_or_none_by_email(user_email)
    if not user:
        raise HTTPError.data_out_of_date_403()

    # if not user.is_active:
    #     raise HTTPError.user_not_active_403()

    return user


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(http_bearer)) -> UserInfo:
    """Retrieves the current user based on the provided JWT token.

    Args:
        credentials (HTTPAuthorizationCredentials): The HTTP authorization credentials containing the JWT token.

    Returns:
        UserInfo: The user object corresponding to the valid JWT token.
    """
    token = credentials.credentials

    user = await descript_and_check_token(token)

    return UserInfo.model_validate(user.__dict__)


async def refresh_access_token(refresh_token: str) -> str:
    """Refreshes the access token using a provided refresh token.

    Args:
        refresh_token (str): The refresh token used to generate a new access token.

    Returns:
        A str, new access token.
    """
    user = await descript_and_check_token(refresh_token)

    new_access_token = create_access_token({"sub": str(user.email), "role": str(user.role)})
    return new_access_token