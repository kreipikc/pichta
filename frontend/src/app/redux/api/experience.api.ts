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
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders(headers) {
      const token = localStorage.getItem("access_token");
      if (token) headers.set("authorization", `Bearer ${token}`);
      return headers;
    },
    credentials: "include",
  }),
  keepUnusedDataFor: 0,
  tagTypes: ["Experience"],
  endpoints: (build) => ({
    getAllExperience: build.query<ExperienceResponseI[], number>({
      query: (userId) => ({
        url: `${EXPER_GETALL_PATH}/${userId}`,
        method: "GET",
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((e) => ({ type: "Experience" as const, id: e.id })),
              { type: "Experience" as const, id: "LIST" },
            ]
          : [{ type: "Experience" as const, id: "LIST" }],
    }),

    // GET /exper/get/{experience_id}
    getExperienceById: build.query<ExperienceResponseI, number>({
      query: (experience_id) => `${EXPER_GET_PATH}/${experience_id}`,
      providesTags: (_r, _e, id) => [{ type: "Experience", id }],
    }),

    // POST /exper/add — для текущего пользователя (из токена)
    addExperienceForSelf: build.mutation<ExperienceResponseI, ExperienceCreateI>({
      query: (body) => ({ url: EXPER_ADD_SELF_PATH, method: "POST", body }),
      invalidatesTags: [{ type: "Experience", id: "LIST" }],
    }),

    // POST /exper/add/{user_id}
    addExperienceForUser: build.mutation<ExperienceResponseI, { user_id: number; data: ExperienceCreateI }>({
      query: ({ user_id, data }) => ({ url: `${EXPER_ADD_FOR_USER_PATH}/${user_id}`, method: "POST", body: data }),
      invalidatesTags: [{ type: "Experience", id: "LIST" }],
    }),

    // PUT /exper/update/{experience_id}
    updateExperience: build.mutation<ExperienceResponseI, { experience_id: number; data: ExperienceUpdateI }>({
      query: ({ experience_id, data }) => ({
        url: `${EXPER_UPDATE_PATH}/${experience_id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_r, _e, arg) => [
        { type: "Experience", id: arg.experience_id },
        { type: "Experience", id: "LIST" },
      ],
    }),

    // DELETE /exper/delete/{experience_id}
    deleteExperience: build.mutation<void, number>({
      query: (experience_id) => ({ url: `${EXPER_DELETE_PATH}/${experience_id}`, method: "DELETE" }),
      invalidatesTags: (_r, _e, id) => [
        { type: "Experience", id },
        { type: "Experience", id: "LIST" },
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
