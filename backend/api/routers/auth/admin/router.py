from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Request, Response

from .schemas import UserUpdate
from .service import AdminRepository, get_admin_repository
from routers.auth.ident.dependencies import require_roles
from routers.auth.user.roles import UserRole
from routers.auth.user.schemas import UserInfo


router = APIRouter()


@router.get(
    path="/getall",
    summary="",
    description="",
    response_description="",
    status_code=status.HTTP_200_OK,
    response_model=List[UserInfo]
)
async def get_all_users(
        admin_repo: AdminRepository = Depends(get_admin_repository),
        current_user: UserInfo = Depends(require_roles([UserRole.admin]))
) -> List[UserInfo]:
    if current_user.role != UserRole.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admin can view all users"
        )
    return await admin_repo.get_all_users()


@router.delete(
    path="/delete/{user_id}",
    summary="",
    description="",
    response_description="",
    status_code=status.HTTP_204_NO_CONTENT,
    response_class=Response
)
async def delete_user(
        user_id: int,
        admin_repo: AdminRepository = Depends(get_admin_repository),
        current_user: UserInfo = Depends(require_roles([UserRole.admin]))
) -> Response:
    await admin_repo.delete_user(user_id)

    return Response(status_code=status.HTTP_204_NO_CONTENT)



@router.put(
    path="/update/{user_id}",
    summary="",
    description="",
    response_description="",
    status_code=status.HTTP_200_OK,
    response_model=UserInfo
)
async def update_user(
        user_id: int,
        user_data: UserUpdate,
        admin_repo: AdminRepository = Depends(get_admin_repository),
        current_user: UserInfo = Depends(require_roles([UserRole.admin]))
) -> UserInfo:
    return UserInfo.model_validate(await admin_repo.update_user(user_id, user_data.model_dump(exclude_unset=True)))