from fastapi import APIRouter, status, Response, Depends
from utils import handle_catch_error
from .schemas import UserInfo, UserUpdate
from .service import UserRepository
from ..auth.dependencies import get_current_user
from .responses.responses import UserResponse


router = APIRouter(prefix="/user", tags=["User 👔"])


@router.get(
    path="/me",
    summary="Information about you",
    description="Returns authenticated user's profile data. Requires valid access token.",
    response_description="User info",
    status_code=status.HTTP_200_OK,
    response_model=UserInfo,
    responses=UserResponse.me_get
)
@handle_catch_error
async def get_me(user_current: UserInfo = Depends(get_current_user)):
    return user_current


@router.post(
    path="/me",
    summary="Update information about you",
    description="Returns status code.",
    response_description="Empty response (status 200)",
    status_code=status.HTTP_200_OK,
    response_model=None,
    responses=UserResponse.me_post
)
@handle_catch_error
async def post_me(user_data: UserUpdate, user_current: UserInfo = Depends(get_current_user)):
    await UserRepository.update_user(user_data=user_data, id_user=user_current.id)
    return Response(status_code=status.HTTP_200_OK)
