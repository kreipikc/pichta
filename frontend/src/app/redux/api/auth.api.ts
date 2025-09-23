import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";

import {API_BASE_URL, LOGIN_PATH, REFRESH_PATH, USER_PATH} from "@/app/redux/api/endpoints";
import { LogInI, TokenI } from "@/shared/types/api/UserI";

export const authApi = createApi({
    reducerPath: 'authApi',
    baseQuery: fetchBaseQuery({
        baseUrl: API_BASE_URL,
        prepareHeaders(headers) {
            const token = localStorage.getItem("access_token")
            if (token) {
                headers.set('authorization', `Bearer ${token}`)
            }
            return headers
        },
        credentials: 'include',
    }),
    endpoints: build => ({
        signIn: build.mutation<TokenI, LogInI>({
            query: (body) => {
                const formData = new FormData();
                formData.append("username", body.username);
                formData.append("password", body.password);

                return {
                    url: LOGIN_PATH,
                    method: 'POST',
                    body: formData,
                };
            },
        }),
        getUser: build.query<void, void>({
            query: () => ({
                url: USER_PATH,
            }),
        }),
        refreshToken: build.query<void, void>({
            query: () => ({
                method: 'POST',
                url: REFRESH_PATH,
            }),
        }),
    }),
})

export const {
    useSignInMutation,
    useGetUserQuery,
    useRefreshTokenQuery
} = authApi