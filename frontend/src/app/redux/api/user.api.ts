import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseQuery";
import { API_BASE_URL, USER_GETALL_PATH, USER_UPDATE_PATH, USER_DELETE_PATH } from "@/app/redux/api/endpoints";
import type { UserInfoI, UserUpdateI } from "@/shared/types/api/UserI";

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: baseQueryWithReauth,
  endpoints: (build) => ({
    getUsers: build.query<UserInfoI[], void>({
      query: () => ({
        url: USER_GETALL_PATH,
        method: "GET",
      }),
    }),

    updateUser: build.mutation<void, { user_id: number; data: UserUpdateI }>({
      query: ({ user_id, data }) => ({
        url: `${USER_UPDATE_PATH}/${user_id}`,
        method: "PUT",
        body: data,
      }),
    }),

    deleteUser: build.mutation<void, number>({
      query: (user_id) => ({
        url: `${USER_DELETE_PATH}/${user_id}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useGetUsersQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = userApi;
