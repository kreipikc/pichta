import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  API_BASE_URL,
  EXPER_GETALL_PATH,
  EXPER_GET_PATH,
  EXPER_ADD_SELF_PATH,
  EXPER_ADD_FOR_USER_PATH,
  EXPER_UPDATE_PATH,
  EXPER_DELETE_PATH,
} from "@/app/redux/api/endpoints";
import type { ExperienceResponseI, ExperienceCreateI, ExperienceUpdateI } from "@/shared/types/api/ExperienceI";

export const experienceApi = createApi({
  reducerPath: "experienceApi",
  tagTypes: ["Experience"],
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
    getAllExperience: build.query<ExperienceResponseI[], number>({
      query: (user_id) => ({ url: `${EXPER_GETALL_PATH}/${user_id}`, method: "GET" }),
      providesTags: (res, _e, user_id) =>
        res
          ? [
              ...res.map((r) => ({ type: "Experience" as const, id: r.id })),
              { type: "Experience", id: `LIST-${user_id}` },
            ]
          : [{ type: "Experience", id: `LIST-${user_id}` }],
    }),

    getExperienceById: build.query<ExperienceResponseI, number>({
      query: (experience_id) => ({ url: `${EXPER_GET_PATH}/${experience_id}`, method: "GET" }),
      providesTags: (_r, _e, id) => [{ type: "Experience", id }],
    }),

    addExperienceForSelf: build.mutation<ExperienceResponseI, ExperienceCreateI>({
      query: (body) => ({ url: `${EXPER_ADD_SELF_PATH}`, method: "POST", body }),
      invalidatesTags: [{ type: "Experience", id: "LIST-SELF" }],
    }),

    addExperienceForUser: build.mutation<ExperienceResponseI, { user_id: number; body: ExperienceCreateI }>({
      query: ({ user_id, body }) => ({ url: `${EXPER_ADD_FOR_USER_PATH}/${user_id}`, method: "POST", body }),
      invalidatesTags: (_r, _e, { user_id }) => [{ type: "Experience", id: `LIST-${user_id}` }],
    }),

    updateExperience: build.mutation<ExperienceResponseI, { user_id: number; experience_id: number; body: ExperienceUpdateI }>({
      query: ({ user_id, experience_id, body }) => ({ url: `${EXPER_UPDATE_PATH}/${experience_id}?user_id=${user_id}`, method: "PUT", body }),
      invalidatesTags: (_r, _e, { user_id, experience_id }) => [
        { type: "Experience", id: experience_id },
        { type: "Experience", id: `LIST-${user_id}` },
      ],
    }),

    deleteExperience: build.mutation<void, { user_id: number; experience_id: number }>({
      query: ({ user_id, experience_id }) => ({ url: `${EXPER_DELETE_PATH}/${experience_id}?user_id=${user_id}`, method: "DELETE" }),
      invalidatesTags: (_r, _e, { user_id, experience_id }) => [
        { type: "Experience", id: experience_id },
        { type: "Experience", id: `LIST-${user_id}` },
      ],
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
