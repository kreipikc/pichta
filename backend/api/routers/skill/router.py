from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Response

from .service import get_skill_repository, SkillRepository
from .schemas import UserSkillCreate, UserSkillResponse
from ..auth.ident.dependencies import get_current_user
from ..auth.user.schemas import UserInfo


router = APIRouter()


@router.get(
    path="/getall",
    summary="Get all skills for user",
    description="",
    response_description="",
    status_code=status.HTTP_200_OK,
    response_model=List[UserSkillResponse],
)
async def get_user_skills(
        skill_repo: SkillRepository = Depends(get_skill_repository),
        current_user: UserInfo = Depends(get_current_user)
) -> List[UserSkillResponse]:
    user_id = int(current_user.id)
    skills = await skill_repo.get_user_skills(user_id)
    return [UserSkillResponse.model_validate(skill) for skill in skills]


@router.get(
    path="/get/",
    summary="Get skill by ID for user",
    description="",
    response_description="",
    status_code=status.HTTP_200_OK,
    response_model=UserSkillResponse,
)
async def get_user_skill(
        skill_id: int,
        skill_repo: SkillRepository = Depends(get_skill_repository),
        current_user: UserInfo = Depends(get_current_user)
) -> UserSkillResponse:
    user_id = int(current_user.id)
    if skill := await skill_repo.get_user_skill(skill_id, user_id):
        return UserSkillResponse.model_validate(skill)
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Skill not found for this user")


@router.post(
    path="/add",
    summary="Add skill for user",
    description="",
    response_description="",
    status_code=status.HTTP_201_CREATED,
    response_model=UserSkillResponse,
)
async def add_user_skill(
        skill_data: UserSkillCreate,
        skill_repo: SkillRepository = Depends(get_skill_repository),
        current_user: UserInfo = Depends(get_current_user)
) -> UserSkillResponse:
    current_user_id = int(current_user.id)

    if skill_data.id_user != current_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Can only add skills for yourself"
        )
    return UserSkillResponse.model_validate(await skill_repo.create_user_skill(skill_data))


@router.put(
    path="/update",
    summary="Update skill for user",
    description="",
    response_description="",
    status_code=status.HTTP_200_OK,
    response_model=UserSkillResponse,
)
async def update_user_skill(
        skill_data: UserSkillCreate,
        skill_repo: SkillRepository = Depends(get_skill_repository),
        current_user: UserInfo = Depends(get_current_user)
) -> UserSkillResponse:
    current_user_id = int(current_user.id)

    if skill_data.id_user != current_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Can only update your own skills"
        )
    return UserSkillResponse.model_validate(await skill_repo.update_user_skill(skill_data.id_skill, skill_data.id_user, skill_data))


@router.delete(
    path="/delete/{skill_id}",
    summary="Delete skill for user",
    description="",
    response_description="",
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