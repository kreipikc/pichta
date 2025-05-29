from fastapi import APIRouter, status


router = APIRouter(prefix="/task", tags=["Tasks"])


@router.get(
    path="/getall",
    summary="",
    description="",
    response_description="All tasks",
    status_code=status.HTTP_200_OK,
    # response_model=,
    # responses=,
)
async def task_get_all():
    pass


@router.get(
    path="/get/{task_id}",
    summary="",
    description="",
    response_description="",
    status_code=status.HTTP_200_OK,
    # response_model=,
    # responses=,
)
async def task_get_by_task_id(task_id: int):
    pass


@router.post(
    path="/add",
    summary="",
    description="",
    response_description="All tasks",
    status_code=status.HTTP_200_OK,
    # response_model=,
    # responses=,
)
async def task_add():
    pass


@router.post(
    path="/add/{user_id}",
    summary="",
    description="",
    response_description="All tasks",
    status_code=status.HTTP_200_OK,
    # response_model=,
    # responses=,
)
async def task_add_by_user_id(user_id: int):
    pass


@router.put(
    path="/update/{task_id}",
    summary="",
    description="",
    response_description="All tasks",
    status_code=status.HTTP_200_OK,
    # response_model=,
    # responses=,
)
async def task_update(task_id: int):
    pass


@router.delete(
    path="/delete/{task_id}",
    summary="",
    description="",
    response_description="All tasks",
    status_code=status.HTTP_200_OK,
    # response_model=,
    # responses=,
)
async def task_delete(task_id: int):
    pass