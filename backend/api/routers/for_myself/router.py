from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Response
from .schemas import WantedProfessionCreate, WantedProfessionRead

from .service import get_for_myself_repository, ForMyselfRepository
from ..auth.ident.dependencies import get_current_user
from ..auth.user.roles import UserRole
from ..auth.user.schemas import UserInfo


router = APIRouter()


@router.get(
    path="/wanted_prof/getall/{user_id}",
    summary="Get wanted user profession by user_id",
    description="Get wanted profession by user_id. All user (admin), yourself (user)",
    response_description="List wanted professions",
    status_code=status.HTTP_200_OK,
    response_model=List[WantedProfessionRead]
)
async def get_wanted_profession(
        user_id: int,
        for_myself_repo: ForMyselfRepository = Depends(get_for_myself_repository),
        current_user: UserInfo = Depends(get_current_user)
) -> List[WantedProfessionRead]:
    if current_user.role != UserRole.admin:
        if current_user.id != user_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="View can only your data")

    prof_list = await for_myself_repo.get_wanted_professions_by_user_id(user_id)

    if not prof_list:
        return []

    return [WantedProfessionRead.model_validate(prof) for prof in prof_list]


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