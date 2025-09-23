import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  API_BASE_URL,
  SKILL_GETALL_SELF_PATH,
  SKILL_GET_ONE_SELF_PATH,
  SKILL_ADD_PATH,
  SKILL_UPDATE_PATH,
  SKILL_DELETE_PATH,
  SKILL_GETALL_PATH,
} from "@/app/redux/api/endpoints";
import type { UserSkillResponseI, UserSkillCreateI } from "@/shared/types/api/SkillI";

export const skillApi = createApi({
  reducerPath: "skillApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders(headers) {
      const token = localStorage.getItem("access_token");
      if (token) headers.set("authorization", `Bearer ${token}`);
      return headers;
    },
    credentials: "include",
  }),
  tagTypes: ["UserSkills"],
  endpoints: (build) => ({
    getAllSkillsSelf: build.query<UserSkillResponseI[], void>({
      query: () => ({ url: SKILL_GETALL_SELF_PATH, method: "GET" }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((s) => ({ type: "UserSkills" as const, id: s.id_skill })),
              { type: "UserSkills", id: "LIST" },
            ]
          : [{ type: "UserSkills", id: "LIST" }],
    }),
    getSkillSelf: build.query<UserSkillResponseI, number>({
      query: (skill_id) => `${SKILL_GET_ONE_SELF_PATH}/${skill_id}`,
      providesTags: (_res, _err, id) => [{ type: "UserSkills", id }],
    }),
    getAllSkills: build.query<Array<{ id: number; name: string }>, void>({
      query: () => ({ url: SKILL_GETALL_PATH, method: "GET" }),
    }),
    addSkill: build.mutation<UserSkillResponseI[] | UserSkillResponseI, UserSkillCreateI[] | UserSkillCreateI>({
      query: (body) => ({
        url: SKILL_ADD_PATH,
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "UserSkills", id: "LIST" }],
    }),
    updateSkill: build.mutation<UserSkillResponseI, UserSkillCreateI>({
      query: (body) => ({ url: SKILL_UPDATE_PATH, method: "PUT", body }),
      invalidatesTags: (res) =>
        res
          ? [{ type: "UserSkills", id: res.id_skill }, { type: "UserSkills", id: "LIST" }]
          : [{ type: "UserSkills", id: "LIST" }],
    }),
    deleteSkill: build.mutation<void, number>({
      query: (skill_id) => ({ url: `${SKILL_DELETE_PATH}/${skill_id}`, method: "DELETE" }),
      invalidatesTags: (_r, _e, id) => [{ type: "UserSkills", id }, { type: "UserSkills", id: "LIST" }],
    }),
  }),
});

export const {
  useGetAllSkillsSelfQuery,
  useGetSkillSelfQuery,
  useAddSkillMutation,
  useUpdateSkillMutation,
  useDeleteSkillMutation,
  useGetAllSkillsQuery,
} = skillApi;
