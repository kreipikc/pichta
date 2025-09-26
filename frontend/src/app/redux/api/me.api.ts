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
    // GET /me/wanted_prof/getall/{user_id}
    getWantedProfessionsByUserId: build.query<WantedProfessionI[], number>({
      query: (userId) => `${ME_WANTED_PROFESSION_GETALL_PATH}/${userId}`,
      providesTags: (_res, _err, userId) => [{ type: "WantedProf", id: `LIST-${userId}` }],
    }),

    // POST /me/wanted_prof/add
    addWantedProfessions: build.mutation<void, WantedProfessionCreateI[] | WantedProfessionCreateI>({
      query: (body) => ({
        url: ME_WANTED_PROFESSION_ADD_PATH,
        method: "POST",
        body: Array.isArray(body) ? body : [body],
      }),
      invalidatesTags: (_res, _err, _arg) => [{ type: "WantedProf", id: "LIST-SELF" }],
    }),
  }),
});

export const {
  useGetWantedProfessionsByUserIdQuery,
  useAddWantedProfessionsMutation,
} = meApi;
