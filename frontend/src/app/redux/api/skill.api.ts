import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  API_BASE_URL,
  SKILL_GETALL_PATH,
  SKILL_GETALL_BY_USER_PATH,
  SKILL_GET_PATH,
  SKILL_ADD_PATH,
  SKILL_UPDATE_PATH,
  SKILL_DELETE_PATH,
} from "@/app/redux/api/endpoints";
import type {
  UserSkillResponseI,
  UserSkillCreateI,
  UserSkillUpdateI,
  SkillResponseI,
} from "@/shared/types/api/SkillI";

export const skillApi = createApi({
  reducerPath: "skillApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders(headers) {
      const token = localStorage.getItem("access_token");
      if (token) headers.set("authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["UserSkills", "SkillsDictionary"],
  endpoints: (builder) => ({
    // словарь (всем общий)
    getAllSkills: builder.query<SkillResponseI[], void>({
      query: () => ({ url: SKILL_GETALL_PATH }),
      providesTags: [{ type: "SkillsDictionary", id: "LIST" }],
    }),

    // ВСЕ навыки пользователя: GET /skill/getall/{user_id}
    getUserSkills: builder.query<UserSkillResponseI[], number>({
      query: (userId) => ({ url: `${SKILL_GETALL_BY_USER_PATH}/${userId}` }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((s) => ({ type: "UserSkills" as const, id: s.id_skill })),
              { type: "UserSkills" as const, id: "LIST" },
            ]
          : [{ type: "UserSkills" as const, id: "LIST" }],
    }),

    // Один навык: GET /skill/get/{skill_id}?user_id={id}
    getUserSkillById: builder.query<UserSkillResponseI, { skillId: number; userId: number }>({
      query: ({ skillId, userId }) => ({
        url: `${SKILL_GET_PATH}/${skillId}`,
        params: { user_id: userId },
      }),
      providesTags: (_r, _e, { skillId }) => [{ type: "UserSkills", id: skillId }],
    }),

    // POST /skill/add — бэк ждёт массив
    addSkill: builder.mutation<void, UserSkillCreateI | UserSkillCreateI[]>({
      query: (data) => ({
        url: SKILL_ADD_PATH,
        method: "POST",
        body: Array.isArray(data) ? data : [data],
      }),
      invalidatesTags: [{ type: "UserSkills", id: "LIST" }],
    }),

    // PUT /skill/update — тоже массив
    updateSkill: builder.mutation<void, { skillId: number; data: UserSkillUpdateI }>({
      query: ({ skillId, data }) => ({
        url: `${SKILL_UPDATE_PATH}/${skillId}`,
        method: "PUT",
        body: data,    // один объект, не массив
      }),
      invalidatesTags: (_r, _e, arg) => [
        { type: "UserSkills", id: arg.skillId },
        { type: "UserSkills", id: "LIST" },
      ],
    }),

    // DELETE /skill/delete/{skill_id}
    deleteSkill: builder.mutation<void, number>({
      query: (skill_id) => ({ url: `${SKILL_DELETE_PATH}/${skill_id}`, method: "DELETE" }),
      invalidatesTags: (_r, _e, id) => [{ type: "UserSkills", id }, { type: "UserSkills", id: "LIST" }],
    }),
  }),
});

export const {
  useGetAllSkillsQuery,
  useGetUserSkillsQuery,
  useGetUserSkillByIdQuery,
  useAddSkillMutation,
  useUpdateSkillMutation,
  useDeleteSkillMutation,
} = skillApi;
