from fastapi import APIRouter, status, Response, Depends
from utils import handle_catch_error
from .roles import UserRole
from .schemas import UserInfo, AboutMeCreate, UserRoleResponse, UserPrint, ChangePass
from .service import UserRepository
from ..ident.dependencies import get_current_user, require_roles
from .responses.responses import UserResponse


router = APIRouter()


@router.get(
    path="/me",
    summary="Information about you",
    description="Returns authenticated user's profile data. Requires valid access token.",
    response_description="User info",
    status_code=status.HTTP_200_OK,
    response_model=UserPrint,
    responses=UserResponse.me_get
)
@handle_catch_error
async def get_me(user_current: UserInfo = Depends(get_current_user)) -> UserPrint:
    return UserPrint.model_validate(user_current.model_dump())


@router.post(
    path="/change_pass",
    summary="Change pass for yourself",
    description="Change pass for yourself",
    response_description="Empty response (status 200)",
    status_code=status.HTTP_200_OK,
    response_class=Response,
    responses=UserResponse.change_pass
)
@handle_catch_error
async def change_pass(user_data: ChangePass, user_current: UserInfo = Depends(get_current_user)) -> Response:
    await UserRepository.update_pass_user(user_current.id, user_data)
    return Response(status_code=status.HTTP_200_OK)


@router.post(
    path="/aboutme",
    summary="Update aboutme for yourself",
    description="Update aboutme for yourself",
    response_description="Status code",
    status_code=status.HTTP_200_OK,
    response_class=Response
)
@handle_catch_error
async def update_about_me(
        data: AboutMeCreate,
        current_user: UserInfo = Depends(require_roles([UserRole.admin, UserRole.manager, UserRole.user]))
) -> Response:
    await UserRepository.update_aboutme(current_user.id, data)
    return Response(status_code=status.HTTP_200_OK)


@router.get(
    path="/get/role",
    summary="Get yourself role",
    description="Get yourself role",
    response_description="Role user",
    status_code=status.HTTP_200_OK,
    response_model=UserRoleResponse
)
@handle_catch_error
async def get_role(
    user_current: UserInfo = Depends(get_current_user)
) -> UserRoleResponse:
    return UserRoleResponse(role=user_current.role.value)