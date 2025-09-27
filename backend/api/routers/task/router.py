from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Response
from fastapi.exceptions import ResponseValidationError

from .service import TaskRepository, get_task_repository
from .schemas import TaskCreate, TaskResponse, TaskCreateSelf, TaskUpdate
from ..auth.ident.dependencies import require_roles, get_current_user
from ..auth.user.roles import UserRole
from ..auth.user.schemas import UserInfo
from ..auth.user.service import UserRepository


router = APIRouter()


# @router.get(
#     path="/getall",
#     summary="Get all tasks for user by user_id",
#     description="Get all tasks for user by user_id",
#     response_description="List tasks",
#     status_code=status.HTTP_200_OK,
#     response_model=List[TaskResponse],
# )
# async def get_all_tasks(
#         task_repo: TaskRepository = Depends(get_task_repository),
#         current_user: UserInfo = Depends(require_roles([UserRole.manager, UserRole.admin]))
# ) -> List[TaskResponse]:
#     if current_user.role == UserRole.admin:
#         tasks = await task_repo.get_all_task()
#     else:
#         tasks = await task_repo.get_user_tasks(current_user.id)
#
#     if not tasks:
#         return []
#
#     return [TaskResponse.model_validate(task) for task in tasks]


@router.get(
    path="/getall/{user_id}",
    summary="Get all tasks for user by user_id",
    description="Get all tasks for user by user_id.  All users (admin), yourself (user)",
    response_description="List tasks",
    status_code=status.HTTP_200_OK,
    response_model=List[TaskResponse],
)
async def get_user_tasks(
        user_id: int,
        task_repo: TaskRepository = Depends(get_task_repository),
        current_user: UserInfo = Depends(get_current_user)
) -> List[TaskResponse]:
    if current_user.role != UserRole.admin:
        if current_user.id != user_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="View can only your data")

    tasks = await task_repo.get_user_tasks(user_id)

    if not tasks:
        return []

    return [TaskResponse.model_validate(task) for task in tasks]


@router.get(
    path="/get/{task_id}",
    summary="Get task",
    description="Get task by task_id",
    response_description="Task object",
    status_code=status.HTTP_200_OK,
    response_model=TaskResponse,
)
async def get_task(
        task_id: int,
        task_repo: TaskRepository = Depends(get_task_repository),
        current_user: UserInfo = Depends(get_current_user)
) -> TaskResponse:
    task = await task_repo.get_task(task_id)
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    return TaskResponse.model_validate(task)


@router.post(
    path="/add",
    summary="Add task for yourself",
    description="Add task for yourself",
    response_description="Data of the created object",
    status_code=status.HTTP_201_CREATED,
    response_model=TaskResponse,
)
async def add_task_for_self(
        task_data: TaskCreateSelf,
        task_repo: TaskRepository = Depends(get_task_repository),
        current_user: UserInfo = Depends(get_current_user)
) -> TaskResponse:
    task_data.created_from = current_user.id
    try:
        return await task_repo.create_task_for_self(current_user.id, task_data)
    except ResponseValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=e.errors()
        )


@router.post(
    path="/add/{user_id}",
    summary="Add task for another user by user_id",
    description="Add task for another user by user_id",
    response_description="Data of the created object",
    status_code=status.HTTP_201_CREATED,
    response_model=TaskResponse,
)
async def add_task_for_user(
        user_id: int,
        task_data: TaskCreate,
        task_repo: TaskRepository = Depends(get_task_repository),
        current_user: UserInfo = Depends(get_current_user)
):
    user = await UserRepository.find_one_or_none_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    task_data.created_from = current_user.id
    return await task_repo.create_task(user_id, task_data)


@router.put(
    path="/update/{task_id}",
    summary="Update task for user",
    description="Update task for user. Admin - all users, user - yourself.",
    response_description="Data of the updated object",
    status_code=status.HTTP_200_OK,
    response_model=TaskResponse,
)
async def update_task(
        task_id: int,
        user_id: int,
        task_data: TaskUpdate,
        task_repo: TaskRepository = Depends(get_task_repository),
        current_user: UserInfo = Depends(get_current_user)
) -> TaskResponse:
    if current_user.role != UserRole.admin:
        if current_user.id != user_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Update can only your data")

    updated_task = await task_repo.update_task(task_id, task_data)

    return updated_task


@router.delete(
    path="/delete/{task_id}",
    summary="Delete task for user",
    description="Delete task for user. Admin - all users, user - yourself.",
    response_description="Status code",
    status_code=status.HTTP_204_NO_CONTENT,
    response_class=Response,
)
async def delete_task(
        task_id: int,
        user_id: int,
        task_repo: TaskRepository = Depends(get_task_repository),
        current_user: UserInfo = Depends(get_current_user)
) -> Response:
    if current_user.role != UserRole.admin:
        if current_user.id != user_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Delete can only your data")

    await task_repo.delete_task(task_id)

    return Response(status_code=status.HTTP_204_NO_CONTENT)