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
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders(headers) {
      const token = localStorage.getItem("access_token");
      if (token) headers.set("authorization", `Bearer ${token}`);
      return headers;
    },
    credentials: "include",
  }),
  tagTypes: ["Education"],
  endpoints: (build) => ({
    getAllEducation: build.query<EducationResponseI[], number>({
      query: (userId) => ({
        url: `${EDUC_GETALL_PATH}/${userId}`,
        method: "GET",
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((e) => ({ type: "Education" as const, id: e.id })),
              { type: "Education" as const, id: "LIST" },
            ]
          : [{ type: "Education" as const, id: "LIST" }],
    }),

    // GET /educ/get/{education_id}
    getEducationById: build.query<EducationResponseI, number>({
      query: (education_id) => ({
        url: `${EDUC_GET_PATH}/${education_id}`,
        method: "GET",
      }),
      providesTags: (_r, _e, id) => [{ type: "Education", id }],
    }),

    // POST /educ/add
    addEducation: build.mutation<EducationResponseI, EducationCreateI>({
      query: (body) => ({
        url: EDUC_ADD_PATH,
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Education", id: "LIST" }],
    }),

    // PUT /educ/update/{education_id}
    updateEducation: build.mutation<EducationResponseI, { education_id: number; body: EducationUpdateI }>({
      query: ({ education_id, body }) => ({
        url: `${EDUC_UPDATE_PATH}/${education_id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_r, _e, { education_id }) => [
        { type: "Education", id: education_id },
        { type: "Education", id: "LIST" },
      ],
    }),

    // DELETE /educ/delete/{education_id}
    deleteEducation: build.mutation<void, number>({
      query: (education_id) => ({
        url: `${EDUC_DELETE_PATH}/${education_id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_r, _e, id) => [
        { type: "Education", id },
        { type: "Education", id: "LIST" },
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
