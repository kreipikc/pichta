from fastapi import APIRouter, status, Response, Request, Depends
from .model import User, Token


router = APIRouter(prefix="/auth", tags=["Auth 👔"])


@router.post(
    path="/register",
    summary="Register new user",
    description="Creates new user account. Hashes password automatically. Email must be unique.",
    response_description="Empty response (status 200)",
    status_code=status.HTTP_201_CREATED,
    response_model=None,
    # responses=,
)
async def register_user(user: User):
    pass


@router.post(
    path="/login",
    summary="User login",
    description="Authenticates user and returns JWT tokens. Sets refresh token as HTTP-only cookie.",
    response_description="Access token (Bearer) and refresh token (Cookie)",
    status_code=status.HTTP_200_OK,
    response_model=Token,
    # responses=,
)
async def login_user(response: Response, user: User):
    # check = await UserRepository.authenticate_user(email=user.email, password=user.password)
    # if check is None:
    #     raise HTTPError.bad_credentials_400()
    #
    # access_token = create_access_token(data={"sub": str(check.email), "role": str(check.role)})
    # create_refresh_token(response=response, data={"sub": str(check.email), "role": str(check.role)})
    #
    # return Token(access_token=access_token, token_type="Bearer")
    pass


@router.post(
    path="/refresh_token",
    summary="Refresh access token",
    description="Generates new access token using valid refresh token. Does not extend refresh token lifespan.",
    response_description="Bearer Token (Access)",
    status_code=status.HTTP_200_OK,
    response_model=Token,
    # responses=UsersResponse.refresh_post,
)
async def refresh_token_point(request: Request):
    # refresh_token = request.cookies.get("refresh_token")
    # if not refresh_token:
    #     raise HTTPError.bad_credentials_401()
    #
    # email = await request.app.redis.get_refresh_token_email(refresh_token)
    # if email:
    #     raise HTTPError.refresh_token_in_black_list_401()
    #
    # access_token = await refresh_access_token(refresh_token=refresh_token)
    # return Token(access_token=access_token, token_type="Bearer")
    pass


# @router.post(
#     path="/logout",
#     summary="Logout, add refresh_token to black list",
#     description="Invalidates refresh token by adding it to blacklist. Requires valid access token.",
#     response_description="Empty response (status 200)",
#     status_code=status.HTTP_200_OK,
#     response_model=None,
#     # responses=base_auth_responses,
# )
# async def logout(request: Request):
#     # refresh_token = request.cookies.get("refresh_token")
#     # if refresh_token:
#     #     await request.app.redis.add_refresh_token_email(user_data.email, refresh_token)
#     # return Response(status_code=status.HTTP_200_OK)
#     pass