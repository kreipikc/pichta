import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { 
  API_BASE_URL, 
  AUTH_LOGIN_PATH, AUTH_REFRESH_PATH, AUTH_LOGOUT_PATH, AUTH_REGISTER_PATH, 
  USER_ME_PATH, USER_ABOUTME_PATH 
} from "@/app/redux/api/endpoints";
import type { LogInI, TokenI, UserInfoI, AboutMeCreateI } from "@/shared/types/api/UserI";

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders(headers) {
      const token = localStorage.getItem('access_token')
      if (token) headers.set('authorization', `Bearer ${token}`)
      return headers
    },
    credentials: 'include',
  }),
  endpoints: (build) => ({
    signIn: build.mutation<TokenI, LogInI>({
      query: (body) => ({
        url: AUTH_LOGIN_PATH,
        method: 'POST',
        body
      }),
      // Save token on success
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          if (data?.access_token) {
            localStorage.setItem('access_token', data.access_token)
          }
        } catch {}
      },
    }),
    register: build.mutation<void, LogInI>({
      query: (body) => ({
        url: AUTH_REGISTER_PATH,
        method: 'POST',
        body
      }),
    }),
    logout: build.mutation<void, void>({
      query: () => ({
        url: AUTH_LOGOUT_PATH,
        method: 'POST',
      }),
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          await queryFulfilled
        } finally {
          localStorage.removeItem('access_token')
        }
      }
    }),
    refreshToken: build.mutation<void, void>({
      query: () => ({
        url: AUTH_REFRESH_PATH,
        method: 'POST',
      }),
    }),
    getMe: build.query<UserInfoI, void>({
      query: () => ({
        url: USER_ME_PATH,
        method: 'GET',
      }),
    }),
    updateMe: build.mutation<UserInfoI, Partial<UserInfoI>>({
      query: (body) => ({
        url: USER_ME_PATH,
        method: 'POST',
        body,
      }),
    }),
    updateAboutMe: build.mutation<void, AboutMeCreateI>({
      query: (body) => ({
        url: USER_ABOUTME_PATH,
        method: 'POST',
        body,
      }),
    }),
  }),
})

export const {
  useSignInMutation,
  useRegisterMutation,
  useLogoutMutation,
  useRefreshTokenMutation,
  useGetMeQuery,
  useUpdateMeMutation,
  useUpdateAboutMeMutation,
} = authApi
