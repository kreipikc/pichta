from fastapi import APIRouter, Depends, HTTPException, status, Response
from .schemas import WantedProfessionCreate

from .service import get_for_myself_repository, ForMyselfRepository
from ..auth.ident.dependencies import require_roles
from ..auth.user.roles import UserRole
from ..auth.user.schemas import UserInfo


router = APIRouter()


@router.post(
    path="/wanted_prof/add",
    summary="Add wanted profession for yourself",
    description="Add wanted profession for yourself",
    response_description="Status code",
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