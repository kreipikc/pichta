from typing import List, Union
from fastapi import APIRouter, Depends, HTTPException, status, Response

from logger import app_logger
from .service import get_skill_repository, SkillRepository
from .schemas import UserSkillCreate, UserSkillResponse, SkillResponse, UserSkillUpdate, SkillOnlyResponse
from ..auth.ident.dependencies import get_current_user, require_roles
from ..auth.user.roles import UserRole
from ..auth.user.schemas import UserInfo


router = APIRouter()


@router.get(
    path="/getall",
    summary="Get all skills",
    description="Get all skills",
    response_description="List skills",
    status_code=status.HTTP_200_OK,
    response_model=List[SkillOnlyResponse],
)
async def get_all_skills(
        skill_repo: SkillRepository = Depends(get_skill_repository),
        current_user: UserInfo = Depends(get_current_user)
) -> List[SkillOnlyResponse]:
    try:
        skills = await skill_repo.get_all_skills()

        if not skills:
            return []
        return [SkillOnlyResponse.model_validate(skill) for skill in skills]
    except HTTPException:
        raise
    except Exception as e:
        app_logger.error(f"Error: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)


@router.get(
    path="/getall/{user_id}",
    summary="Get all skills for user by user_id",
    description="Get all skills for user by user_id. Admin - all users, user - yourself.",
    response_description="List skills",
    status_code=status.HTTP_200_OK,
    response_model=List[SkillResponse],
)
async def get_user_skills(
        user_id: int,
        skill_repo: SkillRepository = Depends(get_skill_repository),
        current_user: UserInfo = Depends(get_current_user)
) -> List[SkillResponse]:
    try:
        if current_user.role != UserRole.admin:
            if user_id != current_user.id:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="View can only your data")

        skills = await skill_repo.get_user_skills(user_id)

        if not skills:
            return []

        return [SkillResponse.model_validate(skill) for skill in skills]
    except HTTPException:
        raise
    except Exception as e:
        app_logger.error(f"Error: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)


@router.get(
    path="/get/{skill_id}",
    summary="Get skill by skill_id and user_id",
    description="Get skill by skill_id and user_id. Admin - all users, user - yourself.",
    response_description="Skill object",
    status_code=status.HTTP_200_OK,
    response_model=Union[SkillResponse, List],
)
async def get_user_skill(
        skill_id: int,
        user_id: int,
        skill_repo: SkillRepository = Depends(get_skill_repository),
        current_user: UserInfo = Depends(get_current_user)
) -> Union[SkillResponse, List]:
    try:
        if current_user.role != UserRole.admin:
            if current_user.id != user_id:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="View can only your data")

        skill = await skill_repo.get_user_skill(skill_id=skill_id, user_id=user_id)

        if not skill:
            return []

        return SkillResponse.model_validate(skill)
    except HTTPException:
        raise
    except Exception as e:
        app_logger.error(f"Error: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)


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
    try:
        await skill_repo.create_user_skills(current_user.id, skill_data)
        return Response(status_code=status.HTTP_201_CREATED)
    except HTTPException:
        raise
    except Exception as e:
        app_logger.error(f"Error: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)


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
    try:
        await skill_repo.create_user_skills(user_id, skill_data)
        return Response(status_code=status.HTTP_201_CREATED)
    except HTTPException:
        raise
    except Exception as e:
        app_logger.error(f"Error: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)


@router.put(
    path="/update/{skill_id}",
    summary="Update skill for user",
    description="Update skill for user. Admin - all users, user - yourself.",
    response_description="Data of the updated object",
    status_code=status.HTTP_200_OK,
    response_model=UserSkillResponse,
)
async def update_user_skill(
        skill_id: int,
        user_id: int,
        skill_data: UserSkillUpdate,
        skill_repo: SkillRepository = Depends(get_skill_repository),
        current_user: UserInfo = Depends(get_current_user)
) -> UserSkillResponse:
    try:
        if current_user.role != UserRole.admin:
            if current_user.id != user_id:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Update can only your data")

        user_skill = await skill_repo.update_user_skill(skill_id, current_user.id, skill_data)

        return UserSkillResponse.model_validate(user_skill)
    except HTTPException:
        raise
    except Exception as e:
        app_logger.error(f"Error: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)


@router.delete(
    path="/delete/{skill_id}",
    summary="Delete skill for user",
    description="Delete skill by skill_id for user. Admin - all users, user - yourself.",
    response_description="Status code",
    status_code=status.HTTP_204_NO_CONTENT,
    response_class=Response,
)
async def delete_user_skill(
        skill_id: int,
        user_id: int,
        skill_repo: SkillRepository = Depends(get_skill_repository),
        current_user: UserInfo = Depends(get_current_user)
) -> Response:
    try:
        if current_user.role != UserRole.admin:
            if current_user.id != user_id:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Delete can only your data")

        await skill_repo.delete_user_skill(skill_id, user_id)

        return Response(status_code=status.HTTP_200_OK)
    except HTTPException:
        raise
    except Exception as e:
        app_logger.error(f"Error: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)