from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Response
from .schemas import WantedProfessionCreate

from .service import get_for_myself_repository, ForMyselfRepository
from ..auth.ident.dependencies import get_current_user
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
        data: List[WantedProfessionCreate],
        for_myself_repo: ForMyselfRepository = Depends(get_for_myself_repository),
        current_user: UserInfo = Depends(get_current_user)
) -> Response:
    await for_myself_repo.create_wanted_professions(current_user.id, data)
    return Response(status_code=status.HTTP_201_CREATED)