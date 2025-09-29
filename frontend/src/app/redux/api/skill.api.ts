import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  API_BASE_URL,
  SKILL_GETALL_PATH,
  SKILL_GETALL_BY_USER_PATH,
  SKILL_GET_PATH,
  SKILL_ADD_SELF_PATH,
  SKILL_ADD_FOR_USER_PATH,
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
  tagTypes: ["UserSkills", "Skills"],
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
    getAllSkills: build.query<SkillResponseI[], void>({
      query: () => ({ url: `${SKILL_GETALL_PATH}`, method: "GET" }),
      providesTags: (res) =>
        res ? [...res.map((s) => ({ type: "Skills" as const, id: s.id })), { type: "Skills", id: "LIST" }] : [{ type: "Skills", id: "LIST" }],
    }),

    getUserSkills: build.query<UserSkillResponseI[], number>({
      query: (user_id) => ({ url: `${SKILL_GETALL_BY_USER_PATH}/${user_id}`, method: "GET" }),
      providesTags: (res, _e, user_id) =>
        res
          ? [
              ...res.map((us) => ({ type: "UserSkills" as const, id: us.id_skill })),
              { type: "UserSkills", id: `LIST-${user_id}` },
            ]
          : [{ type: "UserSkills", id: `LIST-${user_id}` }],
    }),

    getUserSkillById: build.query<UserSkillResponseI, { skillId: number; userId: number }>({
      query: ({ skillId, userId }) => ({
        url: `${SKILL_GET_PATH}/${skillId}`,
        params: { user_id: userId },
      }),
    }),

    // бэк ждёт МАССИВ
    addSkill: build.mutation<void, { user_id?: number; body: UserSkillCreateI | UserSkillCreateI[] }>({
      query: ({ user_id, body }) => {
        const payload = Array.isArray(body) ? body : [body];
        return user_id
          ? { url: `${SKILL_ADD_FOR_USER_PATH}/${user_id}`, method: "POST", body: payload }
          : { url: `${SKILL_ADD_SELF_PATH}`, method: "POST", body: payload };
      },
      invalidatesTags: (_r, _e, args) => [
        { type: "UserSkills", id: args.user_id ? `LIST-${args.user_id}` : "LIST-SELF" },
      ],
    }),

    // здесь тоже обязателен user_id в query
    updateSkill: build.mutation<UserSkillResponseI, { user_id: number; skill_id: number; body: UserSkillUpdateI }>({
      query: ({ user_id, skill_id, body }) => ({ url: `${SKILL_UPDATE_PATH}/${skill_id}?user_id=${user_id}`, method: "PUT", body }),
      invalidatesTags: (_r, _e, { user_id, skill_id }) => [
        { type: "UserSkills", id: skill_id },
        { type: "UserSkills", id: `LIST-${user_id}` },
      ],
    }),

    deleteSkill: build.mutation<void, { user_id: number; skill_id: number }>({
      query: ({ user_id, skill_id }) => ({ url: `${SKILL_DELETE_PATH}/${skill_id}?user_id=${user_id}`, method: "DELETE" }),
      invalidatesTags: (_r, _e, { user_id, skill_id }) => [
        { type: "UserSkills", id: skill_id },
        { type: "UserSkills", id: `LIST-${user_id}` },
      ],
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
