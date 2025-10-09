from fastapi import APIRouter, Depends, HTTPException, status, Response
from typing import List

from .schemas import ProfessionRead, ProfessionCreate, ProfessionUpdate
from .service import ProfessionRepository, get_profession_repository
from ..auth.ident.dependencies import get_current_user, require_roles
from ..auth.user.roles import UserRole
from ..auth.user.schemas import UserInfo


router = APIRouter()


@router.get(
    path="/getall",
    summary="Getting all professions",
    description="Getting all professions",
    response_description="List professions",
    status_code=status.HTTP_200_OK,
    response_model=List[ProfessionRead]
)
async def read_professions(
        profession_repo: ProfessionRepository = Depends(get_profession_repository),
        current_user: UserInfo = Depends(get_current_user)
) -> List[ProfessionRead]:
    profs = await profession_repo.get_all_professions()
    return [ProfessionRead.model_validate(prof) for prof in profs]


@router.get(
    path="/get/{profession_id}",
    summary="Getting an profession",
    description="Getting an profession by id",
    response_description="Profession object",
    status_code=status.HTTP_200_OK,
    response_model=ProfessionRead
)
async def read_profession(
    profession_id: int,
    profession_repo: ProfessionRepository = Depends(get_profession_repository),
    current_user: UserInfo = Depends(require_roles([UserRole.admin]))
) -> ProfessionRead:
    profession = await profession_repo.get_profession_by_id(profession_id)
    if not profession:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profession not found"
        )
    return ProfessionRead.model_validate(profession)


@router.post(
    path="/add",
    summary="Add new profession",
    description="Add a new profession",
    response_description="Data of the created object",
    status_code=status.HTTP_201_CREATED,
    response_model=ProfessionRead
)
async def create_new_profession(
    profession: ProfessionCreate,
    profession_repo: ProfessionRepository = Depends(get_profession_repository),
    current_user: UserInfo = Depends(require_roles([UserRole.admin]))
) -> ProfessionRead:
    return await profession_repo.create_profession(profession)


@router.put(
    path="/update/{profession_id}",
    summary="Update profession",
    description="Update profession by id",
    response_description="Data of the updated object",
    status_code=status.HTTP_200_OK,
    response_model=ProfessionRead
)
async def update_existing_profession(
    profession_id: int,
    profession: ProfessionUpdate,
    profession_repo: ProfessionRepository = Depends(get_profession_repository),
    current_user: UserInfo = Depends(require_roles([UserRole.admin]))
) -> ProfessionRead:
    return await profession_repo.update_profession(profession_id, profession)


@router.delete(
    path="/delete/{profession_id}",
    summary="Delete profession",
    description="Delete profession by id",
    response_description="Status code",
    status_code=status.HTTP_204_NO_CONTENT,
    response_class=Response
)
async def delete_existing_profession(
    profession_id: int,
    profession_repo: ProfessionRepository = Depends(get_profession_repository),
    current_user: UserInfo = Depends(require_roles([UserRole.admin]))
) -> Response:
    await profession_repo.delete_profession(profession_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)