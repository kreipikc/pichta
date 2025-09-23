from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Response

from logger import app_logger
from .service import get_skill_repository, SkillRepository
from .schemas import UserSkillCreate, UserSkillResponse, SkillResponse
from ..auth.ident.dependencies import get_current_user, require_roles
from ..auth.user.roles import UserRole
from ..auth.user.schemas import UserInfo


router = APIRouter()


@router.get(
    path="/getall",
    summary="Get all skills for yourself",
    description="Get all skills for yourself",
    response_description="List skills",
    status_code=status.HTTP_200_OK,
    response_model=List[SkillResponse],
)
async def get_user_skills(
        skill_repo: SkillRepository = Depends(get_skill_repository),
        current_user: UserInfo = Depends(get_current_user)
) -> List[SkillResponse]:
    user_id = int(current_user.id)
    skills = await skill_repo.get_user_skills(user_id)
    return [SkillResponse.model_validate(skill) for skill in skills]


@router.get(
    path="/get/{skill_id}",
    summary="Get skill for yourself by skill_id",
    description="Get skill for yourself by skill_id",
    response_description="Skill object",
    status_code=status.HTTP_200_OK,
    response_model=SkillResponse,
)
async def get_user_skill(
        skill_id: int,
        skill_repo: SkillRepository = Depends(get_skill_repository),
        current_user: UserInfo = Depends(get_current_user)
) -> SkillResponse:
    user_id = int(current_user.id)
    if skill := await skill_repo.get_user_skill(skill_id, user_id):
        app_logger.info(skill)
        return SkillResponse.model_validate(skill)
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Skill not found for this user")


@router.post(
    path="/add",
    summary="Add skill for yourself",
    description="Add skill for yourself",
    response_description="Status code",
    status_code=status.HTTP_201_CREATED,
    response_class=Response
)
async def add_my_skill(
        skill_data: List[UserSkillCreate],
        skill_repo: SkillRepository = Depends(get_skill_repository),
        current_user: UserInfo = Depends(get_current_user)
) -> Response:
    await skill_repo.create_user_skills(current_user.id, skill_data)
    return Response(status_code=status.HTTP_201_CREATED)


@router.post(
    path="/add/{user_id}",
    summary="Add skill for user",
    description="Add skill for specific user (admin only)",
    response_description="Status code",
    status_code=status.HTTP_201_CREATED,
    response_class=Response
)
async def add_user_skill(
        user_id: int,
        skill_data: List[UserSkillCreate],
        skill_repo: SkillRepository = Depends(get_skill_repository),
        current_user: UserInfo = Depends(require_roles([UserRole.admin]))
) -> Response:
    await skill_repo.create_user_skills(user_id, skill_data)
    return Response(status_code=status.HTTP_201_CREATED)


@router.put(
    path="/update",
    summary="Update skill for yourself",
    description="Update skill for yourself",
    response_description="Data of the updated object",
    status_code=status.HTTP_200_OK,
    response_model=UserSkillResponse,
)
async def update_user_skill(
        skill_data: UserSkillCreate,
        skill_repo: SkillRepository = Depends(get_skill_repository),
        current_user: UserInfo = Depends(get_current_user)
) -> UserSkillResponse:
    return UserSkillResponse.model_validate(await skill_repo.update_user_skill(skill_data.id_skill, current_user.id, skill_data))


@router.delete(
    path="/delete/{skill_id}",
    summary="Delete skill for yourself",
    description="Delete skill by skill_id for yourself",
    response_description="Status code",
    status_code=status.HTTP_204_NO_CONTENT,
    response_class=Response,
)
async def delete_user_skill(
        skill_id: int,
        skill_repo: SkillRepository = Depends(get_skill_repository),
        current_user: UserInfo = Depends(get_current_user)
) -> Response:
    current_user_id = int(current_user.id)
    await skill_repo.delete_user_skill(skill_id, current_user_id)
    return Response(status_code=status.HTTP_200_OK)