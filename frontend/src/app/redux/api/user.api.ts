import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { API_BASE_URL, USER_ALL_PATH, USER_CREATE_PATH } from "@/app/redux/api/endpoints"
import { CreateUserI, ReadUserI, UpdateUserI } from "@/shared/types/api/UserI"

export const userApi = createApi({
    reducerPath: "userApi",
    baseQuery: fetchBaseQuery({
        baseUrl: API_BASE_URL,
        prepareHeaders(headers) {
            const token = localStorage.getItem("access_token")
            if (token) {
                headers.set("authorization", `Bearer ${token}`)
            }
            return headers
        },
        credentials: "include",
    }),
    endpoints: (build) => ({
        createUser: build.mutation<ReadUserI, CreateUserI>({
            query: (body) => {
                return {
                    url: USER_CREATE_PATH,
                    method: 'POST',
                    body,
                };
            },
        }),
        getUsers: build.query<ReadUserI, void>({
            query: () => ({
                url: USER_ALL_PATH,
            }),
        }),
        patchUser: build.mutation<void, UpdateUserI>({
            query: ({ id, ...body }) => {
                return {
                    url: `${USER_CREATE_PATH}${id}`,
                    method: "PATCH",
                    body,
                };
            },
        }),
        getUserById: build.query<ReadUserI, number>({
            query: (id) => `${USER_CREATE_PATH}/${id}`,
          }),
        deleteUserById: build.mutation<void, number>({
            query: (id) => {
                return {
                    url: `${USER_CREATE_PATH}/${id}`,
                    method: "DELETE",
                }
            }
        })
    }),
})

export const {
    useCreateUserMutation,
    useGetUsersQuery,
    usePatchUserMutation,
    useGetUserByIdQuery,
    useDeleteUserByIdMutation,
} = userApi
