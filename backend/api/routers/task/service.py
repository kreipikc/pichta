from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException, status, Depends
from .models import TaskOrm
from .schemas import TaskCreate, TaskCreateSelf, TaskUpdate, TaskResponse
from database import get_db
from datetime import datetime, timezone


class TaskRepository:
    def __init__(self, session: AsyncSession = Depends(get_db)):
        self.session = session

    async def get_all_task(self) -> list[TaskOrm]:
        tasks = await self.session.execute(select(TaskOrm))
        return tasks.scalars().all()

    async def create_task_for_self(
            self,
            user_id: int,
            task_data: TaskCreateSelf
    ) -> TaskResponse:
        # Приводим время к timezone-aware если оно передано
        start_time = task_data.start_time
        if start_time and start_time.tzinfo is None:
            start_time = start_time.replace(tzinfo=timezone.utc)

        task = TaskOrm(
            id_user=user_id,
            title=task_data.title,
            description=task_data.description,
            status=task_data.status,
            start_time=start_time or datetime.now(timezone.utc),  # Используем timezone-aware
            end_time=None,  # Явно указываем None для end_time
            created_from=user_id,
        )
        self.session.add(task)
        await self.session.commit()
        await self.session.refresh(task)
        return TaskResponse.model_validate(task)

    async def get_user_tasks(self, user_id: int) -> list[TaskOrm]:
        result = await self.session.execute(
            select(TaskOrm).where(TaskOrm.id_user == user_id))
        return result.scalars().all()

    async def get_task(self, task_id: int) -> TaskOrm | None:
        result = await self.session.execute(
            select(TaskOrm).where(TaskOrm.id == task_id))
        return result.scalar_one_or_none()

    async def create_task(self, user_id: int, task_data: TaskCreate) -> TaskResponse:
        task = TaskOrm(
            id_user=user_id,
            title=task_data.title,
            start_time=datetime.now(timezone.utc),
            end_time=None,
            created_from=task_data.created_from
        )
        self.session.add(task)
        await self.session.commit()
        await self.session.refresh(task)
        return TaskResponse.model_validate(task)

    async def update_task(self, task_id: int, task_data: TaskUpdate) -> TaskResponse:
        task = await self.get_task(task_id)
        if not task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found"
            )

        # Преобразуем Pydantic-модель в словарь
        update_data = task_data.model_dump(exclude_unset=True)

        # Обновляем только переданные поля (игнорируя None)
        for key, value in update_data.items():
            setattr(task, key, value)

        await self.session.commit()
        await self.session.refresh(task)
        return TaskResponse.model_validate(task)

    async def delete_task(self, task_id: int) -> None:
        task = await self.get_task(task_id)
        if not task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found"
            )

        await self.session.delete(task)
        await self.session.commit()


def get_task_repository(db: AsyncSession = Depends(get_db)) -> TaskRepository:
    """ Dependency для FastAPI """
    return TaskRepository(db)