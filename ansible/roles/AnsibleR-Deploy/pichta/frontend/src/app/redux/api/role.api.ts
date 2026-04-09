import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL, ROLE_ALL_PATH, ROLE_PATH } from "@/app/redux/api/endpoints";
import { CreateRoleI, ReadRoleI, UpdateRoleI } from "@/shared/types/api/RoleI";

export const roleApi = createApi({
    reducerPath: 'roleApi',
    baseQuery: fetchBaseQuery({
        baseUrl: API_BASE_URL,
        prepareHeaders(headers) {
            const token = localStorage.getItem("access_token");
            if (token) {
                headers.set('authorization', `Bearer ${token}`);
            }
            return headers;
        },
        credentials: 'include',
    }),
    endpoints: build => ({
        getRoles: build.query<ReadRoleI[], void>({
            query: () => ({
                url: ROLE_ALL_PATH,
                method: 'GET',
            }),
        }),
        createRole: build.mutation<ReadRoleI, CreateRoleI>({
            query: (body) => ({
                url: `${ROLE_PATH}/`,
                method: 'POST',
                body,
            }),
        }),
        updateRole: build.mutation<ReadRoleI, UpdateRoleI>({
            query: ({ id, ...body }) => ({
                url: `${ROLE_PATH}/${id}`,
                method: 'PATCH',
                body,
            }),
        }),
        deleteRole: build.mutation<void, number>({
            query: (id) => ({
                url: `${ROLE_PATH}/${id}`,
                method: 'DELETE',
            }),
        }), 
        getRoleById: build.query<ReadRoleI, number>({
            query: (id) => `${ROLE_PATH}/${id}`,
          }),
    }),
});

export const {
    useGetRolesQuery,
    useCreateRoleMutation,
    useUpdateRoleMutation,
    useDeleteRoleMutation,
    useGetRoleByIdQuery,
} = roleApi;
