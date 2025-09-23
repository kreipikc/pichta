import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL, EXPER_GETALL_PATH, EXPER_GET_PATH, EXPER_ADD_SELF_PATH, EXPER_ADD_FOR_USER_PATH, EXPER_UPDATE_PATH, EXPER_DELETE_PATH } from "@/app/redux/api/endpoints";
import type { ExperienceResponseI, ExperienceCreateI, ExperienceUpdateI } from "@/shared/types/api/ExperienceI";

export const experienceApi = createApi({
  reducerPath: "experienceApi",
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
    getAllExperience: build.query<ExperienceResponseI[], void>({
      query: () => ({ url: EXPER_GETALL_PATH, method: "GET" }),
    }),
    getExperienceById: build.query<ExperienceResponseI, number>({
      query: (experience_id) => `${EXPER_GET_PATH}/${experience_id}`,
    }),
    addExperienceForSelf: build.mutation<ExperienceResponseI, ExperienceCreateI>({
      query: (body) => ({ url: EXPER_ADD_SELF_PATH, method: "POST", body }),
    }),
    addExperienceForUser: build.mutation<ExperienceResponseI, { user_id: number; data: ExperienceCreateI }>({
      query: ({ user_id, data }) => ({ url: `${EXPER_ADD_FOR_USER_PATH}/${user_id}`, method: "POST", body: data }),
    }),
    updateExperience: build.mutation<ExperienceResponseI, { experience_id: number; data: ExperienceUpdateI }>({
      query: ({ experience_id, data }) => ({ url: `${EXPER_UPDATE_PATH}/${experience_id}`, method: "PUT", body: data }),
    }),
    deleteExperience: build.mutation<void, number>({
      query: (experience_id) => ({ url: `${EXPER_DELETE_PATH}/${experience_id}`, method: "DELETE" }),
    }),
  }),
});

export const {
  useGetAllExperienceQuery,
  useGetExperienceByIdQuery,
  useAddExperienceForSelfMutation,
  useAddExperienceForUserMutation,
  useUpdateExperienceMutation,
  useDeleteExperienceMutation,
} = experienceApi;
