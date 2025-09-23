import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL, EDUC_GETALL_PATH, EDUC_GET_PATH, EDUC_ADD_PATH, EDUC_UPDATE_PATH, EDUC_DELETE_PATH } from "@/app/redux/api/endpoints";
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
  endpoints: (build) => ({
    getAllEducation: build.query<EducationResponseI[], void>({
      query: () => ({ url: EDUC_GETALL_PATH, method: "GET" }),
    }),
    getEducationById: build.query<EducationResponseI, number>({
      query: (education_id) => `${EDUC_GET_PATH}/${education_id}`,
    }),
    addEducation: build.mutation<EducationResponseI, EducationCreateI>({
      query: (body) => ({ url: EDUC_ADD_PATH, method: "POST", body }),
    }),
    updateEducation: build.mutation<EducationResponseI, { education_id: number; data: EducationUpdateI }>({
      query: ({ education_id, data }) => ({ url: `${EDUC_UPDATE_PATH}/${education_id}`, method: "PUT", body: data }),
    }),
    deleteEducation: build.mutation<void, number>({
      query: (education_id) => ({ url: `${EDUC_DELETE_PATH}/${education_id}`, method: "DELETE" }),
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
