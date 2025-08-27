from fastapi import APIRouter, Depends, HTTPException, status, Response
from .schemas import WantedProfessionCreate, AboutMeCreate

from .service import get_for_myself_repository, ForMyselfRepository
from ..auth.ident.dependencies import require_roles
from ..auth.user.roles import UserRole
from ..auth.user.schemas import UserInfo


router = APIRouter()


@router.post(
    path="/wanted_prof/add",
    summary="",
    description="",
    response_description="",
    status_code=status.HTTP_201_CREATED,
    response_class=Response
)
async def add_wanted_profession(
        data: WantedProfessionCreate,
        for_myself_repo: ForMyselfRepository = Depends(get_for_myself_repository),
        current_user: UserInfo = Depends(require_roles([UserRole.admin, UserRole.manager]))
) -> Response:
    await for_myself_repo.created_wanted_profession(data)
    return Response(status_code=status.HTTP_201_CREATED)


@router.post(
    path="/aboutme",
    summary="",
    description="",
    response_description="",
    status_code=status.HTTP_200_OK,
    response_class=Response
)
async def update_about_me(
        data: AboutMeCreate,
        for_myself_repo: ForMyselfRepository = Depends(get_for_myself_repository),
        current_user: UserInfo = Depends(require_roles([UserRole.admin, UserRole.manager, UserRole.user]))
) -> Response:
    await for_myself_repo.update_aboutme(current_user.id, data)
    return Response(status_code=status.HTTP_200_OK)