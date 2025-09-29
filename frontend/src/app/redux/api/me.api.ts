import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL, ME_WANTED_PROFESSION_ADD_PATH, ME_WANTED_PROFESSION_GETALL_PATH } from "@/app/redux/api/endpoints";
import type { WantedProfessionCreateI, WantedProfessionI } from "@/shared/types/api/ForMyselfI";

export const meApi = createApi({
  reducerPath: "meApi",
  tagTypes: ["WantedProf"],
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
    getWantedProfessionsByUserId: build.query<WantedProfessionI[], number>({
      // arg: user_id
      query: (user_id) => ({ url: `${ME_WANTED_PROFESSION_GETALL_PATH}/${user_id}`, method: "GET" }),
      providesTags: (_r, _e, user_id) => [{ type: "WantedProf", id: `LIST-${user_id}` }],
    }),

    addWantedProfessions: build.mutation<void, WantedProfessionCreateI | WantedProfessionCreateI[]>({
      query: (body) => ({
        url: ME_WANTED_PROFESSION_ADD_PATH,
        method: "POST",
        body: Array.isArray(body) ? body : [body],
      }),
      invalidatesTags: [{ type: "WantedProf", id: "LIST-SELF" }],
    }),
  }),
});

export const {
  useGetWantedProfessionsByUserIdQuery,
  useAddWantedProfessionsMutation,
} = meApi;
