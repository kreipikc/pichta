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
import type { TaskResponseI, TaskCreateI, TaskCreateSelfI, TaskUpdateI } from "@/shared/types/api/TaskI";

export type TaskUpdatePatch = { user_id: number; task_id: number; body: TaskUpdateI };

export const taskApi = createApi({
  reducerPath: "taskApi",
  tagTypes: ["Tasks"],
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders(headers) {
      const token = localStorage.getItem("access_token");
      if (token) headers.set("authorization", `Bearer ${token}`);
      return headers;
    },
    credentials: "include",
  }),
  endpoints: (build) => ({
    getAllTasks: build.query<TaskResponseI[], number>({
      query: (user_id) => ({ url: `${TASK_GETALL_PATH}/${user_id}`, method: "GET" }),
      providesTags: (res, _e, user_id) =>
        res
          ? [
              ...res.map((t) => ({ type: "Tasks" as const, id: t.id })),
              { type: "Tasks", id: `LIST-${user_id}` },
            ]
          : [{ type: "Tasks", id: `LIST-${user_id}` }],
    }),

    getTaskById: build.query<TaskResponseI, number>({
      query: (task_id) => ({ url: `${TASK_GET_PATH}/${task_id}`, method: "GET" }),
      providesTags: (_r, _e, id) => [{ type: "Tasks", id }],
    }),

    addTaskForSelf: build.mutation<TaskResponseI, TaskCreateSelfI>({
      query: (body) => ({ url: `${TASK_ADD_SELF_PATH}`, method: "POST", body }),
      invalidatesTags: [{ type: "Tasks", id: "LIST-SELF" }],
    }),

    addTaskForUser: build.mutation<TaskResponseI, { user_id: number; body: TaskCreateI }>({
      query: ({ user_id, body }) => ({ url: `${TASK_ADD_FOR_USER_PATH}/${user_id}`, method: "POST", body }),
      invalidatesTags: (_r, _e, { user_id }) => [{ type: "Tasks", id: `LIST-${user_id}` }],
    }),

    updateTask: build.mutation<TaskResponseI, TaskUpdatePatch>({
      query: ({ user_id, task_id, body }) => ({ url: `${TASK_UPDATE_PATH}/${task_id}?user_id=${user_id}`, method: "PUT", body }),
      invalidatesTags: (_r, _e, { user_id, task_id }) => [
        { type: "Tasks", id: task_id },
        { type: "Tasks", id: `LIST-${user_id}` },
      ],
    }),

    deleteTask: build.mutation<void, { user_id: number; task_id: number }>({
      query: ({ user_id, task_id }) => ({ url: `${TASK_DELETE_PATH}/${task_id}?user_id=${user_id}`, method: "DELETE" }),
      invalidatesTags: (_r, _e, { user_id, task_id }) => [
        { type: "Tasks", id: task_id },
        { type: "Tasks", id: `LIST-${user_id}` },
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
