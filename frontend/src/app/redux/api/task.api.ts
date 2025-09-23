import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL, TASK_GETALL_PATH, TASK_GET_PATH, TASK_ADD_SELF_PATH, TASK_ADD_FOR_USER_PATH, TASK_UPDATE_PATH, TASK_DELETE_PATH } from "@/app/redux/api/endpoints";
import type { TaskResponseI, TaskCreateI, TaskCreateSelfI, TaskUpdateI } from "@/shared/types/api/TaskI";

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
  endpoints: (build) => ({
    getAllTasks: build.query<TaskResponseI[], void>({
      query: () => ({ url: TASK_GETALL_PATH, method: "GET" }),
    }),
    getTaskById: build.query<TaskResponseI, number>({
      query: (task_id) => `${TASK_GET_PATH}/${task_id}`,
    }),
    addTaskForSelf: build.mutation<TaskResponseI, TaskCreateSelfI>({
      query: (body) => ({ url: TASK_ADD_SELF_PATH, method: "POST", body }),
    }),
    addTaskForUser: build.mutation<TaskResponseI, { user_id: number; data: TaskCreateI }>({
      query: ({ user_id, data }) => ({ url: `${TASK_ADD_FOR_USER_PATH}/${user_id}`, method: "POST", body: data }),
    }),
    updateTask: build.mutation<TaskResponseI, { task_id: number; data: TaskUpdateI }>({
      query: ({ task_id, data }) => ({ url: `${TASK_UPDATE_PATH}/${task_id}`, method: "PUT", body: data }),
    }),
    deleteTask: build.mutation<void, number>({
      query: (task_id) => ({ url: `${TASK_DELETE_PATH}/${task_id}`, method: "DELETE" }),
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
