from fastapi import APIRouter, status, Response, Request, Depends
from utils import handle_catch_error
from .dependencies import refresh_access_token, get_current_user
from .schemas import UserRegister, UserLogin, Token
from .responses.responses import IdentResponse, base_auth_responses
from .responses.http_errors import HTTPError
from .service import AuthRepository
from .utils import get_password_hash, create_refresh_token, create_access_token
from ..user.schemas import UserInfo
from ..user.service import UserRepository


router = APIRouter()


@router.post(
    path="/register",
    summary="Register new user",
    description="Creates new user account. Hashes password automatically. Email must be unique.",
    response_description="Empty response (status 200)",
    status_code=status.HTTP_201_CREATED,
    response_model=None,
    responses=IdentResponse.register_post,
)
@handle_catch_error
async def register_user(user: UserRegister) -> Response:
    user.password = get_password_hash(user.password)
    await UserRepository.create_user(user)
    return Response(status_code=status.HTTP_201_CREATED)


@router.post(
    path="/login",
    summary="User login",
    description="Authenticates user and returns JWT tokens. Sets refresh token as HTTP-only cookie.",
    response_description="Access token (Bearer) and refresh token (Cookie)",
    status_code=status.HTTP_200_OK,
    response_model=Token,
    responses=IdentResponse.login_post,
)
@handle_catch_error
async def login_user(response: Response, user: UserLogin) -> Token:
    check_user = await AuthRepository.authenticate_user(email=user.email, password=user.password)
    if check_user is None:
        raise HTTPError.bad_credentials_400()

    access_token = create_access_token(data={"sub": str(check_user.email)})
    create_refresh_token(response=response, data={"sub": str(check_user.email)})

    return Token(access_token=access_token, token_type="Bearer")


@router.post(
    path="/refresh_token",
    summary="Refresh access token",
    description="Generates new access token using valid refresh token. Does not extend refresh token lifespan.",
    response_description="Bearer Token (Access)",
    status_code=status.HTTP_200_OK,
    response_model=Token,
    responses=IdentResponse.refresh_post,
)
@handle_catch_error
async def refresh_token_point(request: Request) -> Token:
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPError.bad_credentials_401()

    access_token = await refresh_access_token(refresh_token=refresh_token)
    return Token(access_token=access_token, token_type="Bearer")


@router.post(
    path="/logout",
    summary="Logout, deleted refresh token (Cookie)",
    description="Deleted refresh token (Cookie). Requires valid access token.",
    response_description="Empty response (status 200)",
    status_code=status.HTTP_200_OK,
    response_model=None,
    responses=base_auth_responses,
)
@handle_catch_error
async def logout(response: Response, user_current: UserInfo = Depends(get_current_user)) -> Response:
    response.delete_cookie(
        key="refresh_token",
        path="/",
        secure=False,
        httponly=True,
    )
    response.status_code = status.HTTP_200_OK
    return response