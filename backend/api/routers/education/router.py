from fastapi import APIRouter, Depends, HTTPException, status, Response
from typing import List

from .schemas import EducationResponse, EducationCreate, EducationUpdate
from .service import EducationRepository, get_education_repository
from ..auth.ident.dependencies import require_roles, get_current_user
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
    if current_user.role != UserRole.admin:
        if user_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="View can only your data")

    educ_list = await education_repository.get_education_by_user(user_id)

    if not educ_list:
        return []

    return [EducationResponse.model_validate(ed) for ed in educ_list]


@router.get(
    path="/get/{education_id}",
    summary="Getting an education by education_id",
    description="Getting an education by education_id",
    response_description="Education Object",
    status_code=status.HTTP_200_OK,
    response_model=EducationResponse
)
async def get_education(
        education_id: int,
        education_repository: EducationRepository = Depends(get_education_repository),
        current_user: UserInfo = Depends(get_current_user)
):
    education = await education_repository.get_education_by_id(education_id)
    if not education:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Education record not found"
        )
    return education


@router.post(
    path="/add",
    summary="Creating a new education",
    description="Creating a new education",
    response_description="Data of the created object",
    status_code=status.HTTP_201_CREATED,
    response_model=EducationResponse
)
async def add_education(
        education_data: EducationCreate,
        education_repository: EducationRepository = Depends(get_education_repository),
        current_user: UserInfo = Depends(get_current_user)
):
    return await education_repository.create_education(education_data)


@router.put(
    path="/update/{education_id}",
    summary="Education update",
    description="Education update by education_id",
    response_description="Updated object data",
    status_code=status.HTTP_200_OK,
    response_model=EducationResponse
)
async def update_education_endpoint(
        education_id: int,
        education_data: EducationUpdate,
        education_repository: EducationRepository = Depends(get_education_repository),
        current_user: UserInfo = Depends(require_roles([UserRole.manager, UserRole.admin]))
):
    return await education_repository.update_education(education_id, education_data)


@router.delete(
    path="/delete/{education_id}",
    summary="Deleting education",
    description="Deleting education by education_id",
    response_description="Status code",
    status_code=status.HTTP_200_OK,
    response_class=Response
)
async def delete_education_endpoint(
        education_id: int,
        education_repository: EducationRepository = Depends(get_education_repository),
        current_user: UserInfo = Depends(require_roles([UserRole.manager, UserRole.admin]))
):
    await education_repository.delete_education(education_id)
    return Response(status_code=status.HTTP_200_OK)