from fastapi import APIRouter, status, Response, Request, Depends
from .schemas import UserInfo, UserUpdate
from ..auth.dependencies import get_current_user
from ..auth.responses.responses import base_auth_responses


router = APIRouter(prefix="/user", tags=["User 👔"])


@router.get(
    path="/me",
    summary="Information about you",
    description="Returns authenticated user's profile data. Requires valid access token.",
    response_description="User info",
    status_code=status.HTTP_200_OK,
    response_model=UserInfo,
    responses=base_auth_responses,
)
async def get_me(user_current: UserInfo = Depends(get_current_user)):
    return user_current


@router.post(
    path="/me",
    summary="",
    description="",
    response_description="Empty response (status 200)",
    status_code=status.HTTP_200_OK,
)
async def post_me(user: UserUpdate, user_current: UserInfo = Depends(get_current_user)):
    pass
    # Редактирование пользователя (себя)