import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseQuery";
import {
  SKILL_GETALL_PATH,
  SKILL_GETALL_BY_USER_PATH,
  SKILL_GET_PATH,
  SKILL_ADD_SELF_PATH,
  SKILL_ADD_FOR_USER_PATH,
  SKILL_UPDATE_PATH,
  SKILL_DELETE_PATH,
  SKILL_GET_PROCESS_BY_USER_PATH,
} from "@/app/redux/api/endpoints";
import type {
  UserSkillResponseI,
  UserSkillCreateI,
  UserSkillUpdateI,
  SkillResponseI,
  SkillProcessI,
} from "@/shared/types/api/SkillI";

export const skillApi = createApi({
  reducerPath: "skillApi",
  tagTypes: ["UserSkills", "Skills", "SkillProcesses"],
  baseQuery: baseQueryWithReauth,
  endpoints: (build) => ({
    getAllSkills: build.query<SkillResponseI[], void>({
      query: () => ({ url: `${SKILL_GETALL_PATH}`, method: "GET" }),
      providesTags: (res) =>
        res
          ? [
              ...res.map((s) => ({ type: "Skills" as const, id: s.id })),
              { type: "Skills", id: "LIST" },
            ]
          : [{ type: "Skills", id: "LIST" }],
    }),

    getUserSkills: build.query<UserSkillResponseI[], number>({
      query: (user_id) => ({
        url: `${SKILL_GETALL_BY_USER_PATH}/${user_id}`,
        method: "GET",
      }),
      providesTags: (res, _e, user_id) =>
        res
          ? [
              ...res.map((us) => ({ type: "UserSkills" as const, id: us.id_skill })),
              { type: "UserSkills", id: `LIST-${user_id}` },
            ]
          : [{ type: "UserSkills", id: `LIST-${user_id}` }],
    }),

    getUserSkillById: build.query<
      UserSkillResponseI,
      { skillId: number; userId: number }
    >({
      query: ({ skillId, userId }) => ({
        url: `${SKILL_GET_PATH}/${skillId}`,
        params: { user_id: userId },
      }),
    }),

    addSkill: build.mutation<
      void,
      { user_id?: number; body: UserSkillCreateI | UserSkillCreateI[] }
    >({
      query: ({ user_id, body }) => {
        const payload = (Array.isArray(body) ? body : [body]).map(({ ...dto }) => ({
          id_skill: dto.id_skill,
          proficiency: dto.proficiency,
          priority: dto.priority ?? null,
          start_date: dto.start_date,
          end_date: dto.end_date,
          status: dto.status,
        }));

        return user_id
          ? { url: `${SKILL_ADD_FOR_USER_PATH}/${user_id}`, method: "POST", body: payload }
          : { url: `${SKILL_ADD_SELF_PATH}`, method: "POST", body: payload };
      },
      invalidatesTags: (_r, _e, args) => [
        { type: "UserSkills", id: args.user_id ? `LIST-${args.user_id}` : "LIST-SELF" },
      ],
    }),

    updateSkill: build.mutation<
      UserSkillResponseI,
      { user_id: number; skill_id: number; body: UserSkillUpdateI }
    >({
      query: ({ user_id, skill_id, body }) => ({
        url: `${SKILL_UPDATE_PATH}/${skill_id}?user_id=${user_id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_r, _e, { user_id, skill_id }) => [
        { type: "UserSkills", id: skill_id },
        { type: "UserSkills", id: `LIST-${user_id}` },
      ],
    }),

    deleteSkill: build.mutation<void, { user_id: number; skill_id: number }>({
      query: ({ user_id, skill_id }) => ({
        url: `${SKILL_DELETE_PATH}/${skill_id}?user_id=${user_id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_r, _e, { user_id, skill_id }) => [
        { type: "UserSkills", id: skill_id },
        { type: "UserSkills", id: `LIST-${user_id}` },
      ],
    }),

    getUserSkillProcesses: build.query<SkillProcessI[], number>({
      query: (user_id) => ({
        url: `${SKILL_GET_PROCESS_BY_USER_PATH}/${user_id}/process`,
        method: "GET",
      }),
      providesTags: (_res, _e, user_id) => [
        { type: "SkillProcesses", id: `LIST-${user_id}` },
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
  useGetUserSkillProcessesQuery,
} = skillApi;
