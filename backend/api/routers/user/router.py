from fastapi import APIRouter, status, Response, Request, Depends
from .model import UserInfo, UserCreate


router = APIRouter(prefix="/user", tags=["User 👔"])


@router.get(
    path="/me",
    summary="Information about you",
    description="Returns authenticated user's profile data. Requires valid access token.",
    response_description="User info",
    status_code=status.HTTP_200_OK,
    # response_model=UserInfo,
    # responses=base_auth_responses,
)
async def get_me(user_id: int):
    return user_id # вернем юзера по id


@router.post(
    path="/me",
    summary="",
    description="",
    response_description="Empty response (status 200)",
    status_code=status.HTTP_200_OK,
)
async def post_me(user: UserCreate):
    pass
    # Создание пользователя