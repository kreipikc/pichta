import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL, SKILL_GETALL_SELF_PATH, SKILL_GET_ONE_SELF_PATH, SKILL_ADD_PATH, SKILL_UPDATE_PATH, SKILL_DELETE_PATH } from "@/app/redux/api/endpoints";
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
  endpoints: (build) => ({
    getAllSkillsSelf: build.query<UserSkillResponseI[], void>({
      query: () => ({ url: SKILL_GETALL_SELF_PATH, method: "GET" }),
    }),
    getSkillSelf: build.query<UserSkillResponseI, number>({
      query: (skill_id) => `${SKILL_GET_ONE_SELF_PATH}/${skill_id}`,
    }),
    addSkill: build.mutation<UserSkillResponseI, UserSkillCreateI>({
      query: (body) => ({ url: SKILL_ADD_PATH, method: "POST", body }),
    }),
    updateSkill: build.mutation<UserSkillResponseI, UserSkillCreateI>({
      query: (body) => ({ url: SKILL_UPDATE_PATH, method: "PUT", body }),
    }),
    deleteSkill: build.mutation<void, number>({
      query: (skill_id) => ({ url: `${SKILL_DELETE_PATH}/${skill_id}`, method: "DELETE" }),
    }),
  }),
});

export const {
  useGetAllSkillsSelfQuery,
  useGetSkillSelfQuery,
  useAddSkillMutation,
  useUpdateSkillMutation,
  useDeleteSkillMutation,
} = skillApi;
