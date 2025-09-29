import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  API_BASE_URL,
  EDUC_GETALL_PATH,
  EDUC_GET_PATH,
  EDUC_ADD_PATH,
  EDUC_UPDATE_PATH,
  EDUC_DELETE_PATH,
} from "@/app/redux/api/endpoints";
import type { EducationResponseI, EducationCreateI, EducationUpdateI } from "@/shared/types/api/EducationI";

export const educationApi = createApi({
  reducerPath: "educationApi",
  tagTypes: ["Education"],
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
    getAllEducation: build.query<EducationResponseI[], number>({
      query: (user_id) => ({ url: `${EDUC_GETALL_PATH}/${user_id}`, method: "GET" }),
      providesTags: (res, _e, user_id) =>
        res
          ? [
              ...res.map((r) => ({ type: "Education" as const, id: r.id })),
              { type: "Education", id: `LIST-${user_id}` },
            ]
          : [{ type: "Education", id: `LIST-${user_id}` }],
    }),

    getEducationById: build.query<EducationResponseI, number>({
      query: (education_id) => ({ url: `${EDUC_GET_PATH}/${education_id}`, method: "GET" }),
      providesTags: (_r, _e, id) => [{ type: "Education", id }],
    }),

    addEducation: build.mutation<EducationResponseI, { user_id: number; body: EducationCreateI }>({
      query: ({ user_id, body }) => ({
        url: `${EDUC_ADD_PATH}/${user_id}`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_r, _e, { user_id }) => [{ type: "Education", id: `LIST-${user_id}` }],
    }),

    updateEducation: build.mutation<EducationResponseI, { user_id: number; education_id: number; body: EducationUpdateI }>({
      query: ({ user_id, education_id, body }) => ({
        url: `${EDUC_UPDATE_PATH}/${education_id}?user_id=${user_id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_r, _e, { user_id, education_id }) => [
        { type: "Education", id: education_id },
        { type: "Education", id: `LIST-${user_id}` },
      ],
    }),

    deleteEducation: build.mutation<void, { user_id: number; education_id: number }>({
      query: ({ user_id, education_id }) => ({
        url: `${EDUC_DELETE_PATH}/${education_id}?user_id=${user_id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_r, _e, { user_id, education_id }) => [
        { type: "Education", id: education_id },
        { type: "Education", id: `LIST-${user_id}` },
      ],
    }),
  }),
});

export const {
  useGetAllEducationQuery,
  useGetEducationByIdQuery,
  useAddEducationMutation,
  useUpdateEducationMutation,
  useDeleteEducationMutation,
} = educationApi;
