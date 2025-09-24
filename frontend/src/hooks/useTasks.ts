import { useMemo, useCallback } from "react";
import {
  useGetAllTasksQuery,
  useAddTaskForSelfMutation,
  useAddTaskForUserMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  TaskUpdatePatch,
} from "@/app/redux/api/task.api";
import type {
  TaskResponseI,
  TaskCreateSelfI,
  TaskCreateI,
} from "@/shared/types/api/TaskI";

export function useTasks(userId?: number) {
  const skip = !userId;

  const {
    data: tasks = [],
    isLoading,
    isFetching,
    error,
  } = useGetAllTasksQuery(userId as number, { skip });

  const [addSelf, addSelfState] = useAddTaskForSelfMutation();
  const [addForUser, addForUserState] = useAddTaskForUserMutation();
  const [updateTask, updateState] = useUpdateTaskMutation();
  const [deleteTask, deleteState] = useDeleteTaskMutation();

  const sorted = useMemo<TaskResponseI[]>(
    () =>
      [...tasks].sort((a, b) => {
        const da = a.start_time ? new Date(a.start_time).getTime() : 0;
        const db = b.start_time ? new Date(b.start_time).getTime() : 0;
        return db - da;
      }),
    [tasks]
  );

  const addForMe = useCallback(
    async (payload: TaskCreateSelfI) => {
      await addSelf(payload).unwrap();
      // без ручного refetch: invalidatesTags в API сам перезапросит список
    },
    [addSelf]
  );

  const addFor = useCallback(
    async (uid: number, payload: TaskCreateI) => {
      await addForUser({ user_id: uid, body: payload }).unwrap();
    },
    [addForUser]
  );

  const patch = useCallback(
    async (taskId: number, body: TaskUpdatePatch) => {
      const cleaned: TaskUpdatePatch = Object.fromEntries(
        Object.entries(body).filter(([, v]) => v !== undefined)
      );
      await updateTask({ task_id: taskId, body: cleaned }).unwrap();
    },
    [updateTask]
  );

  const remove = useCallback(
    async (taskId: number) => {
      await deleteTask(taskId).unwrap();
    },
    [deleteTask]
  );

  return {
    tasks: sorted,
    isLoading: isLoading || isFetching,
    error,
    addForMe,
    addFor,
    patch,
    remove,
    states: {
      addingSelf: addSelfState.isLoading,
      addingForUser: addForUserState.isLoading,
      updating: updateState.isLoading,
      deleting: deleteState.isLoading,
    },
  };
}
