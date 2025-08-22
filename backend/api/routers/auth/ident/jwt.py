from datetime import datetime, timezone, timedelta
from jose import jwt, JWTError, ExpiredSignatureError
from fastapi import Response

from routers.auth.ident.responses.http_errors import HTTPError
from routers.auth.user.models import UserOrm
from routers.auth.user.service import UserRepository

from config import (
    SECRET_KEY_JWT,
    ALGORITHM,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    REFRESH_TOKEN_EXPIRE_DAYS,
)


class JWTService:
    """ Class for working with JWT """

    @staticmethod
    def create_access_token(data: dict) -> str:
        """Creates encoded access token.

        Args:
            data (dict): Information for encoding in access token.

        Returns:
            A str, encoded token.
        """
        to_encode = data.copy()
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        to_encode.update({"exp": expire})
        encode_jwt = jwt.encode(to_encode, SECRET_KEY_JWT, algorithm=ALGORITHM)
        return encode_jwt

    @staticmethod
    def create_refresh_token(response: Response, data: dict) -> None:
        """Creates encoded refresh token and sets it as a cookie in the response.

        Args:
            response (Response): The HTTP response object
            data (dict): Information for encoding in access token.

        Returns:
            None
        """
        to_encode = data.copy()
        expire = datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
        to_encode.update({"exp": expire})
        encode_jwt = jwt.encode(to_encode, SECRET_KEY_JWT, algorithm=ALGORITHM)
        response.set_cookie(
            key="refresh_token",
            value=encode_jwt,
            expires=datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS),
            secure=False,
            httponly=True,
        )

    @staticmethod
    async def refresh_access_token(refresh_token: str) -> str:
        """Refreshes the access token using a provided refresh token.

        Args:
            refresh_token (str): The refresh token used to generate a new access token.

        Returns:
            A str, new access token.
        """
        user = await JWTService.descript_and_check_token(refresh_token)

        new_access_token = JWTService.create_access_token({"sub": str(user.id)})
        return new_access_token

    @staticmethod
    async def descript_and_check_token(token: str) -> UserOrm:
        try:
            payload = jwt.decode(token, SECRET_KEY_JWT, algorithms=[ALGORITHM])
        except ExpiredSignatureError:
            raise HTTPError.bad_credentials_403()
        except JWTError:
            raise HTTPError.invalid_token_401()

        if not (user_id := payload.get('sub')):
            raise HTTPError.invalid_token_401()

        if not (user := await UserRepository.find_one_or_none_by_id(int(user_id))):
            raise HTTPError.data_out_of_date_403()

        # if not user.is_active:
        #     raise HTTPError.user_not_active_403()

        return user