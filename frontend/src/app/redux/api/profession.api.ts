import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL, PROF_GETALL_PATH, PROF_GET_PATH, PROF_ADD_PATH, PROF_UPDATE_PATH, PROF_DELETE_PATH } from "@/app/redux/api/endpoints";
import type { ProfessionResponseI, ProfessionCreateI, ProfessionUpdateI } from "@/shared/types/api/ProfessionI";

export const professionApi = createApi({
  reducerPath: "professionApi",
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
    getAllProfession: build.query<ProfessionResponseI[], void>({
      query: () => ({ url: PROF_GETALL_PATH, method: "GET" }),
    }),
    getProfessionById: build.query<ProfessionResponseI, number>({
      query: (profession_id) => ({ url: `${PROF_GET_PATH}/${profession_id}`, method: "GET" }),
    }),
    addProfession: build.mutation<ProfessionResponseI, ProfessionCreateI>({
      query: (body) => ({ url: PROF_ADD_PATH, method: "POST", body }),
    }),
    updateProfession: build.mutation<ProfessionResponseI, { profession_id: number; body: ProfessionUpdateI }>({
      query: ({ profession_id, body }) => ({ url: `${PROF_UPDATE_PATH}/${profession_id}`, method: "PUT", body }),
    }),
    deleteProfession: build.mutation<void, number>({
      query: (profession_id) => ({ url: `${PROF_DELETE_PATH}/${profession_id}`, method: "DELETE" }),
    }),
  }),
});

export const {
  useGetAllProfessionQuery,
  useGetProfessionByIdQuery,
  useAddProfessionMutation,
  useUpdateProfessionMutation,
  useDeleteProfessionMutation,
} = professionApi;
