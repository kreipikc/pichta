import pytest

from types import SimpleNamespace
from unittest.mock import AsyncMock
from fastapi import HTTPException, Response, status
from jose import ExpiredSignatureError, JWTError, jwt as jose_jwt

from routers.auth.ident.jwt import JWTService
from routers.auth.ident.responses.http_errors import IdentErrorCode
from routers.auth.ident import jwt as jwt_module


pytestmark = pytest.mark.anyio


@pytest.fixture
def anyio_backend():
    return "asyncio"


@pytest.fixture
def jwt_settings(monkeypatch):
    secret = "test-secret"
    algorithm = "HS256"

    monkeypatch.setattr(jwt_module, "SECRET_KEY_JWT", secret)
    monkeypatch.setattr(jwt_module, "ALGORITHM", algorithm)
    monkeypatch.setattr(jwt_module, "ACCESS_TOKEN_EXPIRE_MINUTES", 30)
    monkeypatch.setattr(jwt_module, "REFRESH_TOKEN_EXPIRE_DAYS", 7)

    return secret, algorithm


def test_create_access_token_encodes_payload(jwt_settings):
    secret, algorithm = jwt_settings

    token = JWTService.create_access_token({"sub": "7"})
    payload = jose_jwt.decode(token, secret, algorithms=[algorithm])

    assert payload["sub"] == "7"
    assert "exp" in payload


def test_create_refresh_token_sets_cookie(jwt_settings):
    secret, algorithm = jwt_settings
    response = Response()

    JWTService.create_refresh_token(response, {"sub": "9"})

    cookie_header = response.headers["set-cookie"]
    token = cookie_header.split("refresh_token=")[1].split(";")[0]
    payload = jose_jwt.decode(token, secret, algorithms=[algorithm])

    assert "refresh_token=" in cookie_header
    assert "HttpOnly" in cookie_header
    assert payload["sub"] == "9"


async def test_descript_and_check_token_returns_user_for_valid_token(jwt_settings, monkeypatch):
    user = SimpleNamespace(id=7)
    lookup_mock = AsyncMock(return_value=user)
    monkeypatch.setattr(jwt_module.UserRepository, "find_one_or_none_by_id", lookup_mock)

    token = JWTService.create_access_token({"sub": str(user.id)})
    result = await JWTService.descript_and_check_token(token)

    assert result is user
    lookup_mock.assert_awaited_once_with(7)


async def test_descript_and_check_token_rejects_expired_token(monkeypatch):
    monkeypatch.setattr(
        jwt_module.jwt,
        "decode",
        lambda *args, **kwargs: (_ for _ in ()).throw(ExpiredSignatureError()),
    )

    with pytest.raises(HTTPException) as exc_info:
        await JWTService.descript_and_check_token("expired-token")

    assert exc_info.value.status_code == status.HTTP_403_FORBIDDEN
    assert exc_info.value.detail["code"] == IdentErrorCode.BAD_CREDENTIALS


async def test_descript_and_check_token_rejects_invalid_token(monkeypatch):
    monkeypatch.setattr(
        jwt_module.jwt,
        "decode",
        lambda *args, **kwargs: (_ for _ in ()).throw(JWTError()),
    )

    with pytest.raises(HTTPException) as exc_info:
        await JWTService.descript_and_check_token("invalid-token")

    assert exc_info.value.status_code == status.HTTP_401_UNAUTHORIZED
    assert exc_info.value.detail["code"] == IdentErrorCode.INVALID_TOKEN


async def test_descript_and_check_token_rejects_token_without_sub(jwt_settings):
    secret, algorithm = jwt_settings
    token = jose_jwt.encode({"scope": "access"}, secret, algorithm=algorithm)

    with pytest.raises(HTTPException) as exc_info:
        await JWTService.descript_and_check_token(token)

    assert exc_info.value.status_code == status.HTTP_401_UNAUTHORIZED
    assert exc_info.value.detail["code"] == IdentErrorCode.INVALID_TOKEN


async def test_descript_and_check_token_rejects_missing_user(jwt_settings, monkeypatch):
    lookup_mock = AsyncMock(return_value=None)
    monkeypatch.setattr(jwt_module.UserRepository, "find_one_or_none_by_id", lookup_mock)

    token = JWTService.create_access_token({"sub": "11"})

    with pytest.raises(HTTPException) as exc_info:
        await JWTService.descript_and_check_token(token)

    assert exc_info.value.status_code == status.HTTP_403_FORBIDDEN
    assert exc_info.value.detail["code"] == IdentErrorCode.DATA_OUT_OF_DATE
    lookup_mock.assert_awaited_once_with(11)


async def test_refresh_access_token_creates_new_access_token(jwt_settings, monkeypatch):
    secret, algorithm = jwt_settings
    monkeypatch.setattr(
        JWTService,
        "descript_and_check_token",
        AsyncMock(return_value=SimpleNamespace(id=3)),
    )

    new_access_token = await JWTService.refresh_access_token("refresh-token")
    payload = jose_jwt.decode(new_access_token, secret, algorithms=[algorithm])

    assert payload["sub"] == "3"
    assert "exp" in payload
