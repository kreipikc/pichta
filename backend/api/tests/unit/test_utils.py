import pytest
from fastapi import HTTPException, status

from routers.auth.ident.responses.http_errors import IdentErrorCode
from routers.auth.user.responses.http_errors import UserErrorCode
from utils import handle_catch_error


pytestmark = pytest.mark.anyio


@pytest.fixture
def anyio_backend():
    return "asyncio"


@pytest.mark.parametrize(
    ("input_status", "input_code", "expected_status", "expected_code", "expected_reason"),
    [
        (
            status.HTTP_400_BAD_REQUEST,
            IdentErrorCode.BAD_CREDENTIALS,
            status.HTTP_400_BAD_REQUEST,
            IdentErrorCode.BAD_CREDENTIALS,
            "Bad credentials",
        ),
        (
            status.HTTP_401_UNAUTHORIZED,
            IdentErrorCode.BAD_CREDENTIALS,
            status.HTTP_401_UNAUTHORIZED,
            IdentErrorCode.BAD_CREDENTIALS,
            "Could not validate credentials",
        ),
        (
            status.HTTP_401_UNAUTHORIZED,
            IdentErrorCode.INVALID_TOKEN,
            status.HTTP_401_UNAUTHORIZED,
            IdentErrorCode.INVALID_TOKEN,
            "Invalid token",
        ),
        (
            status.HTTP_401_UNAUTHORIZED,
            IdentErrorCode.REFRESH_TOKEN_IN_BLACK_LIST,
            status.HTTP_401_UNAUTHORIZED,
            IdentErrorCode.REFRESH_TOKEN_IN_BLACK_LIST,
            "Refresh_token in black list",
        ),
        (
            status.HTTP_403_FORBIDDEN,
            IdentErrorCode.BAD_CREDENTIALS,
            status.HTTP_403_FORBIDDEN,
            IdentErrorCode.BAD_CREDENTIALS,
            "Access token expires but refresh exists",
        ),
        (
            status.HTTP_403_FORBIDDEN,
            IdentErrorCode.NO_ACCESS_RIGHTS,
            status.HTTP_403_FORBIDDEN,
            IdentErrorCode.NO_ACCESS_RIGHTS,
            "No required access rights",
        ),
        (
            status.HTTP_403_FORBIDDEN,
            IdentErrorCode.USER_NOT_ACTIVE,
            status.HTTP_403_FORBIDDEN,
            IdentErrorCode.USER_NOT_ACTIVE,
            "User is not active",
        ),
        (
            status.HTTP_403_FORBIDDEN,
            IdentErrorCode.DATA_OUT_OF_DATE,
            status.HTTP_403_FORBIDDEN,
            IdentErrorCode.DATA_OUT_OF_DATE,
            "User data is out of date, please re-login",
        ),
        (
            status.HTTP_409_CONFLICT,
            IdentErrorCode.LOGIN_ALREADY_EXISTS,
            status.HTTP_409_CONFLICT,
            IdentErrorCode.LOGIN_ALREADY_EXISTS,
            "Login is already taken",
        ),
        (
            status.HTTP_404_NOT_FOUND,
            UserErrorCode.USER_NOT_FOUND,
            status.HTTP_404_NOT_FOUND,
            UserErrorCode.USER_NOT_FOUND,
            "User not found",
        ),
    ],
)
async def test_handle_catch_error_maps_known_http_errors(
    input_status: int,
    input_code: str,
    expected_status: int,
    expected_code: str,
    expected_reason: str,
):
    @handle_catch_error
    async def test_func():
        raise HTTPException(
            status_code=input_status,
            detail={"code": input_code, "reason": "some text"},
        )

    with pytest.raises(HTTPException) as exc_info:
        await test_func()

    assert exc_info.value.status_code == expected_status
    assert exc_info.value.detail["code"] == expected_code
    assert exc_info.value.detail["reason"] == expected_reason


async def test_handle_catch_error_reraises_unknown_http_exception():
    @handle_catch_error
    async def test_func():
        raise HTTPException(
            status_code=status.HTTP_418_IM_A_TEAPOT,
            detail={"code": "UNKNOWN_CODE", "reason": "original reason"},
        )

    with pytest.raises(HTTPException) as exc_info:
        await test_func()

    assert exc_info.value.status_code == status.HTTP_418_IM_A_TEAPOT
    assert exc_info.value.detail["code"] == "UNKNOWN_CODE"
    assert exc_info.value.detail["reason"] == "original reason"


async def test_handle_catch_error_converts_unexpected_exception_to_500():
    @handle_catch_error
    async def test_func():
        raise Exception()

    with pytest.raises(HTTPException) as exc_info:
        await test_func()

    assert exc_info.value.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR
    assert exc_info.value.detail["code"] == IdentErrorCode.ENDPOINT_NOT_FOUND
    assert exc_info.value.detail["reason"] == "Endpoint not found"


async def test_handle_catch_error_returns_successful_result():
    @handle_catch_error
    async def test_func():
        return {"ok": True}

    result = await test_func()

    assert result == {"ok": True}
