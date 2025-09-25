import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  API_BASE_URL,
  TASK_GETALL_PATH,
  TASK_GET_PATH,
  TASK_ADD_SELF_PATH,
  TASK_ADD_FOR_USER_PATH,
  TASK_UPDATE_PATH,
  TASK_DELETE_PATH,
} from "@/app/redux/api/endpoints";
import type {
  TaskResponseI,
  TaskCreateI,
  TaskCreateSelfI,
  TaskUpdateI,
} from "@/shared/types/api/TaskI";

export type TaskUpdatePatch = Partial<TaskUpdateI>;

export const taskApi = createApi({
  reducerPath: "taskApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders(headers) {
      const token = localStorage.getItem("access_token");
      if (token) headers.set("authorization", `Bearer ${token}`);
      return headers;
    },
    credentials: "include",
  }),
  tagTypes: ["Tasks"],
  endpoints: (build) => ({
    getAllTasks: build.query<TaskResponseI[], number>({
      query: (user_id) => ({
        url: `${TASK_GETALL_PATH}/${user_id}`,
        method: "GET",
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((t) => ({ type: "Tasks" as const, id: t.id })),
              { type: "Tasks" as const, id: "LIST" },
            ]
          : [{ type: "Tasks" as const, id: "LIST" }],
    }),

    // GET /task/get/{task_id}
    getTaskById: build.query<TaskResponseI, number>({
      query: (task_id) => ({
        url: `${TASK_GET_PATH}/${task_id}`,
        method: "GET",
      }),
      providesTags: (_r, _e, id) => [{ type: "Tasks", id }],
    }),

    // POST /task/add (создать себе)
    addTaskForSelf: build.mutation<void, TaskCreateSelfI>({
      query: (body) => ({
        url: `${TASK_ADD_SELF_PATH}`,
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Tasks", id: "LIST" }],
    }),

    // POST /task/add/{user_id} (создать для пользователя)
    addTaskForUser: build.mutation<void, { user_id: number; body: TaskCreateI }>({
      query: ({ user_id, body }) => ({
        url: `${TASK_ADD_FOR_USER_PATH}/${user_id}`,
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Tasks", id: "LIST" }],
    }),

    // PUT /task/update/{task_id}
    updateTask: build.mutation<void, { task_id: number; body: TaskUpdatePatch }>({
      query: ({ task_id, body }) => ({
        url: `${TASK_UPDATE_PATH}/${task_id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_r, _e, arg) => [
        { type: "Tasks", id: arg.task_id },
        { type: "Tasks", id: "LIST" },
      ],
    }),

    // DELETE /task/delete/{task_id}
    deleteTask: build.mutation<void, number>({
      query: (task_id) => ({
        url: `${TASK_DELETE_PATH}/${task_id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_r, _e, id) => [
        { type: "Tasks", id },
        { type: "Tasks", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetAllTasksQuery,
  useGetTaskByIdQuery,
  useAddTaskForSelfMutation,
  useAddTaskForUserMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
} = taskApi;
