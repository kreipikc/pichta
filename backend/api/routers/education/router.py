from fastapi import APIRouter, Depends, HTTPException, status, Response
from typing import List, Union

from logger import app_logger
from .schemas import EducationResponse, EducationCreate, EducationUpdate
from .service import EducationRepository, get_education_repository
from ..auth.ident.dependencies import get_current_user
from ..auth.user.roles import UserRole
from ..auth.user.schemas import UserInfo


router = APIRouter()


# @router.get(
#     path="/getall",
#     summary="Getting all educations",
#     description="Getting all educations by user_id",
#     response_description="List educations",
#     status_code=status.HTTP_200_OK,
#     response_model=List[EducationResponse],
# )
# async def get_all_education(
#         education_repository: EducationRepository = Depends(get_education_repository),
#         current_user: UserInfo = Depends(get_current_user)
# ) -> List[EducationResponse]:
#     if current_user.role == UserRole.admin:
#         educ_list = await education_repository.get_all_education()
#     else:
#         educ_list = await education_repository.get_education_by_user(current_user.id)
#
#     if not educ_list:
#         return []
#
#     return [EducationResponse.model_validate(ed) for ed in educ_list]


@router.get(
    path="/getall/{user_id}",
    summary="Getting all educations for user by user_id",
    description="Getting all educations for user by user_id. All users (admin), yourself (user)",
    response_description="List educations",
    status_code=status.HTTP_200_OK,
    response_model=List[EducationResponse],
)
async def get_all_education_for_user(
        user_id: int,
        education_repository: EducationRepository = Depends(get_education_repository),
        current_user: UserInfo = Depends(get_current_user)
) -> List[EducationResponse]:
    try:
        if current_user.role != UserRole.admin:
            if user_id != current_user.id:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="View can only your data")

        educ_list = await education_repository.get_all_education_by_user(user_id)

        if not educ_list:
            return []

        return [EducationResponse.model_validate(ed) for ed in educ_list]
    except HTTPException:
        raise
    except Exception as e:
        app_logger.error(f"Error: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)


@router.get(
    path="/get/{education_id}",
    summary="Getting an education for user.",
    description="Getting an education for user. Admin - all users, user - yourself.",
    response_description="Education Object",
    status_code=status.HTTP_200_OK,
    response_model=Union[EducationResponse, List]
)
async def get_education(
        education_id: int,
        user_id: int,
        education_repository: EducationRepository = Depends(get_education_repository),
        current_user: UserInfo = Depends(get_current_user)
) -> Union[EducationResponse, List]:
    try:
        if current_user.role != UserRole.admin:
            if user_id != current_user.id:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="View can only your data")

        education = await education_repository.get_education_by_id_for_user(education_id, user_id)
        if not education:
            return []

        return EducationResponse.model_validate(education)
    except HTTPException:
        raise
    except Exception as e:
        app_logger.error(f"Error: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)


@router.post(
    path="/add/{user_id}",
    summary="Creating a new education for user",
    description="Creating a new education for user. Admin - all users, user - yourself",
    response_description="Data of the created object",
    status_code=status.HTTP_201_CREATED,
    response_model=EducationResponse
)
async def add_education(
        user_id: int,
        education_data: EducationCreate,
        education_repository: EducationRepository = Depends(get_education_repository),
        current_user: UserInfo = Depends(get_current_user)
) -> EducationResponse:
    try:
        if current_user.role != UserRole.admin:
            if current_user.id != user_id:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Create can only your data")

        response = await education_repository.create_education(user_id, education_data)

        return EducationResponse.model_validate(response)
    except HTTPException:
        raise
    except Exception as e:
        app_logger.error(f"Error: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)


@router.put(
    path="/update/{education_id}",
    summary="Education update for user",
    description="Education update for user. Admin - all users, user - yourself.",
    response_description="Updated object data",
    status_code=status.HTTP_200_OK,
    response_model=EducationResponse
)
async def update_education_endpoint(
        education_id: int,
        user_id: int,
        education_data: EducationUpdate,
        education_repository: EducationRepository = Depends(get_education_repository),
        current_user: UserInfo = Depends(get_current_user)
):
    try:
        if current_user.role != UserRole.admin:
            if current_user.id != user_id:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Update can only your data")

        response = await education_repository.update_education(user_id, education_id, education_data)

        return response
    except HTTPException:
        raise
    except Exception as e:
        app_logger.error(f"Error: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)



@router.delete(
    path="/delete/{education_id}",
    summary="Deleting education for user",
    description="Deleting education for user. Admin - all users, user - yourself.",
    response_description="Status code",
    status_code=status.HTTP_200_OK,
    response_class=Response
)
async def delete_education_endpoint(
        education_id: int,
        user_id: int,
        education_repository: EducationRepository = Depends(get_education_repository),
        current_user: UserInfo = Depends(get_current_user)
):
    try:
        if current_user.role != UserRole.admin:
            if current_user.id != user_id:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Delete can only your data")

        await education_repository.delete_user_education(user_id, education_id)
        return Response(status_code=status.HTTP_200_OK)
    except HTTPException:
        raise
    except Exception as e:
        app_logger.error(f"Error: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)
