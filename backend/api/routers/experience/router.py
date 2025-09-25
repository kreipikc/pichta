from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Response

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
    if current_user.role != UserRole.admin:
        if current_user.id != user_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="View can only your data")

    exper_list = await experience_repo.get_user_experiences(user_id)

    if not exper_list:
        return []

    return [ExperienceResponse.model_validate(exp) for exp in exper_list]


@router.get(
    path="/get/{experience_id}",
    summary="Get experience",
    description="Get experience by experience_id",
    response_description="Experience object",
    status_code=status.HTTP_200_OK,
    response_model=ExperienceResponse
)
async def get_experience(
        experience_id: int,
        experience_repo: ExperienceRepository = Depends(get_experience_repository),
        current_user: UserInfo = Depends(require_roles([UserRole.manager, UserRole.admin]))
) -> ExperienceResponse:
    experience = await experience_repo.get_experience(experience_id)

    if not experience:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Experience not found")

    return experience


@router.post(
    path="/add",
    summary="Add experience",
    description="Add experience for self",
    response_description="Data of a new object of experience",
    status_code=status.HTTP_201_CREATED,
    response_model=ExperienceResponse,
)
async def add_experience_for_self(
        experience_data: ExperienceCreate,
        experience_repo: ExperienceRepository = Depends(get_experience_repository),
        current_user: UserInfo = Depends(get_current_user)
) -> ExperienceResponse:
    return await experience_repo.create_experience_for_self(current_user.id, experience_data)


@router.post(
    path="/add/{user_id}",
    summary="Add experience for user",
    description="Add experience for user by id",
    response_description="Data of a new object of experience",
    status_code=status.HTTP_201_CREATED,
    response_model=ExperienceResponse,
)
async def add_experience_for_user(
        user_id: int,
        experience_data: ExperienceCreate,
        experience_repo: ExperienceRepository = Depends(get_experience_repository),
        current_user: UserInfo = Depends(require_roles([UserRole.manager, UserRole.admin]))
) -> ExperienceResponse:
    return await experience_repo.create_experience(experience_data, user_id)


@router.put(
    path="/update/{experience_id}",
    summary="Update experience",
    description="Update experience by id",
    response_description="Data of a updated object of experience",
    status_code=status.HTTP_200_OK,
    response_model=ExperienceResponse
)
async def update_experience(
        experience_id: int,
        experience_data: ExperienceUpdate,
        experience_repo: ExperienceRepository = Depends(get_experience_repository),
        current_user: UserInfo = Depends(require_roles([UserRole.manager, UserRole.admin]))
) -> ExperienceResponse:
    return await experience_repo.update_experience(experience_id, experience_data)


@router.delete(
    path="/delete/{experience_id}",
    summary="Delete experience",
    description="Delete experience by id",
    response_description="Status code",
    status_code=status.HTTP_204_NO_CONTENT,
    response_class=Response
)
async def delete_experience(
        experience_id: int,
        experience_repo: ExperienceRepository = Depends(get_experience_repository),
        current_user: UserInfo = Depends(require_roles([UserRole.manager, UserRole.admin]))
) -> Response:
    await experience_repo.delete_experience(experience_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)