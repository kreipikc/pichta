from typing import List, Union
from fastapi import APIRouter, Depends, HTTPException, status, Response

from logger import app_logger
from .service import get_experience_repository, ExperienceRepository
from .schemas import ExperienceResponse, ExperienceUpdate, ExperienceCreate
from ..auth.user.roles import UserRole
from ..auth.user.schemas import UserInfo
from ..auth.ident.dependencies import require_roles, get_current_user


router = APIRouter()


# @router.get(
#     path="/getall",
#     summary="Get all experiences",
#     description="Get all experiences. All experiences (admin), all yourself (user)",
#     response_description="List experiences",
#     status_code=status.HTTP_200_OK,
#     response_model=List[ExperienceResponse]
# )
# async def get_all_experiences(
#         experience_repo: ExperienceRepository = Depends(get_experience_repository),
#         current_user: UserInfo = Depends(get_current_user)
# ) -> List[ExperienceResponse]:
#     if current_user.role == UserRole.admin:
#         exper_list = await experience_repo.get_all_experience()
#     else:
#         exper_list = await experience_repo.get_user_experiences(current_user.id)
#
#     if not exper_list:
#         return []
#
#     return [ExperienceResponse.model_validate(exp) for exp in exper_list]


@router.get(
    path="/getall/{user_id}",
    summary="Get all experiences for user by user_id",
    description="Get all experiences for user by user_id. All users (admin), yourself (user)",
    response_description="List experiences",
    status_code=status.HTTP_200_OK,
    response_model=List[ExperienceResponse]
)
async def get_user_experiences(
        user_id: int,
        experience_repo: ExperienceRepository = Depends(get_experience_repository),
        current_user: UserInfo = Depends(get_current_user)
) -> List[ExperienceResponse]:
    try:
        if current_user.role != UserRole.admin:
            if current_user.id != user_id:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="View can only your data")

        exper_list = await experience_repo.get_user_all_experiences(user_id)

        if not exper_list:
            return []

        return [ExperienceResponse.model_validate(exp) for exp in exper_list]
    except HTTPException:
        raise
    except Exception as e:
        app_logger.error(f"Error: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)


@router.get(
    path="/get/{experience_id}",
    summary="Get experience for user.",
    description="Get experience for user. Admin - all users, user - yourself.",
    response_description="Experience object",
    status_code=status.HTTP_200_OK,
    response_model=Union[ExperienceResponse, List]
)
async def get_experience(
        experience_id: int,
        user_id: int,
        experience_repo: ExperienceRepository = Depends(get_experience_repository),
        current_user: UserInfo = Depends(get_current_user)
) -> Union[ExperienceResponse, List]:
    try:
        if current_user.role != UserRole.admin:
            if current_user.id != user_id:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="View can only your data")

        experience = await experience_repo.get_user_experience(user_id, experience_id)

        if not experience:
            return []

        return ExperienceResponse.model_validate(experience)
    except HTTPException:
        raise
    except Exception as e:
        app_logger.error(f"Error: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)


@router.post(
    path="/add",
    summary="Add experience for yourself",
    description="Add experience for yourself",
    response_description="Data of a new object of experience",
    status_code=status.HTTP_201_CREATED,
    response_model=ExperienceResponse,
)
async def add_experience_for_user(
        experience_data: ExperienceCreate,
        experience_repo: ExperienceRepository = Depends(get_experience_repository),
        current_user: UserInfo = Depends(get_current_user)
) -> ExperienceResponse:
    try:
        return await experience_repo.create_experience_for_user(current_user.id, experience_data)
    except HTTPException:
        raise
    except Exception as e:
        app_logger.error(f"Error: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)


@router.post(
    path="/add/{user_id}",
    summary="Add experience for user",
    description="Add experience for user. Admin - all users, user - yourself.",
    response_description="Data of a new object of experience",
    status_code=status.HTTP_201_CREATED,
    response_model=Union[ExperienceResponse, List],
)
async def add_experience_for_self(
        user_id: int,
        experience_data: ExperienceCreate,
        experience_repo: ExperienceRepository = Depends(get_experience_repository),
        current_user: UserInfo = Depends(get_current_user)
) -> Union[ExperienceResponse, List]:
    try:
        if current_user.role != UserRole.admin:
            if current_user.id != user_id:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Create can only your data")

        result = await experience_repo.create_experience_for_user(user_id, experience_data)

        if not result:
            return []

        return result
    except HTTPException:
        raise
    except Exception as e:
        app_logger.error(f"Error: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)


@router.put(
    path="/update/{experience_id}",
    summary="Update experience for user",
    description="Update experience for user. Admin - all users, user - yourself.",
    response_description="Data of a updated object of experience",
    status_code=status.HTTP_200_OK,
    response_model=Union[ExperienceResponse, List]
)
async def update_experience(
        experience_id: int,
        user_id: int,
        experience_data: ExperienceUpdate,
        experience_repo: ExperienceRepository = Depends(get_experience_repository),
        current_user: UserInfo = Depends(get_current_user)
) -> Union[ExperienceResponse, List]:
    try:
        if current_user.role != UserRole.admin:
            if current_user.id != user_id:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Update can only your data")

        response = await experience_repo.update_experience_for_user(user_id, experience_id, experience_data)

        if not response:
            return []

        return response
    except HTTPException:
        raise
    except Exception as e:
        app_logger.error(f"Error: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)


@router.delete(
    path="/delete/{experience_id}",
    summary="Delete experience for user",
    description="Delete experience for user. Admin - all users, user - yourself.",
    response_description="Status code",
    status_code=status.HTTP_204_NO_CONTENT,
    response_class=Response
)
async def delete_experience(
        experience_id: int,
        user_id: int,
        experience_repo: ExperienceRepository = Depends(get_experience_repository),
        current_user: UserInfo = Depends(get_current_user)
) -> Response:
    try:
        if current_user.role != UserRole.admin:
            if current_user.id != user_id:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Delete can only your data")

        await experience_repo.delete_user_experience(user_id, experience_id)
        return Response(status_code=status.HTTP_204_NO_CONTENT)
    except HTTPException:
        raise
    except Exception as e:
        app_logger.error(f"Error: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)
