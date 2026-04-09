import { useCallback, useMemo } from "react";
import {
  useGetAllTasksQuery,
  useAddTaskForSelfMutation,
  useAddTaskForUserMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
} from "@/app/redux/api/task.api";
import type {
  TaskResponseI,
  TaskCreateSelfI,
  TaskCreateI,
  TaskUpdateI,
} from "@/shared/types/api/TaskI";

function toIso(v: string | Date | null | undefined): string | null {
  if (!v) return null;
  if (typeof v === "string") return v;
  const d = v as Date;
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

export function useTasks(userId?: number) {
  const skip = !userId;

  const {
    data = [],
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetAllTasksQuery(userId as number, {
    skip,
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  const [addSelfMut, addSelfState] = useAddTaskForSelfMutation();
  const [addForUserMut, addForUserState] = useAddTaskForUserMutation();
  const [updateMut, updateState] = useUpdateTaskMutation();
  const [deleteMut, deleteState] = useDeleteTaskMutation();

  const tasks = (data as TaskResponseI[]) ?? [];

  const byId = useMemo(() => {
    const m = new Map<number, TaskResponseI>();
    for (const t of tasks) m.set(t.id, t);
    return m;
  }, [tasks]);

  const addForMe = useCallback(
    async (body: TaskCreateSelfI) => {
      const payload: TaskCreateSelfI = {
        ...body,
        start_time: toIso(body.start_time),
        end_time: toIso(body.end_time),
      };
      await addSelfMut(payload).unwrap();
      await refetch();
    },
    [addSelfMut, refetch]
  );

  const addFor = useCallback(
    async (body: TaskCreateI) => {
      if (!userId) throw new Error("userId is required");
      const payload: TaskCreateI = {
        ...body,
        start_time: toIso(body.start_time),
        end_time: toIso(body.end_time),
      };
      await addForUserMut({ user_id: userId, body: payload }).unwrap();
      await refetch();
    },
    [addForUserMut, refetch, userId]
  );

  const patch = useCallback(
    async (task_id: number, bodyIn: Partial<TaskUpdateI> | any) => {
      if (!userId) throw new Error("userId is required");

      const current = byId.get(task_id);

      if (!current) {
        const minimal: TaskUpdateI = {
          title: bodyIn?.title,
          description: bodyIn?.description ?? null,
          status: bodyIn?.status,
          start_time: toIso(bodyIn?.start_time),
          end_time: toIso(bodyIn?.end_time),
        };
        await updateMut({ task_id, user_id: userId, body: minimal }).unwrap();
        await refetch();
        return;
      }

      // Собираем ПОЛНЫЙ объект: если поле не пришло (=== undefined) — берём текущее значение
      const payload: TaskUpdateI = {
        title: bodyIn?.title !== undefined ? bodyIn.title : (current.title ?? ""),
        description:
          bodyIn?.description !== undefined
            ? (bodyIn.description ?? null)
            : (current.description ?? null),
        status:
          bodyIn?.status !== undefined
            ? bodyIn.status
            : (current.status as TaskUpdateI["status"]),
        start_time:
          bodyIn?.start_time !== undefined
            ? toIso(bodyIn.start_time)
            : toIso(current.start_time),
        end_time:
          bodyIn?.end_time !== undefined
            ? toIso(bodyIn.end_time)
            : toIso(current.end_time),
      };

      await updateMut({ task_id, user_id: userId, body: payload }).unwrap();
      await refetch();
    },
    [updateMut, refetch, userId, byId]
  );

  const remove = useCallback(
    async (task_id: number) => {
      if (!userId) throw new Error("userId is required");
      await deleteMut({ user_id: userId, task_id }).unwrap();
      await refetch();
    },
    [deleteMut, refetch, userId]
  );

  return {
    tasks,
    isLoading: isLoading || isFetching || skip,
    addForMe,
    patch,
    remove,
    states: {
      addingSelf: addSelfState.isLoading,
      addingForUser: addForUserState.isLoading,
      updating: updateState.isLoading,
      deleting: deleteState.isLoading,
    },
    list: tasks,
    addFor,
    error,
    refetch,
  };
}
