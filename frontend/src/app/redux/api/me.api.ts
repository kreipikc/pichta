import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL, ME_WANTED_PROFESSION_ADD_PATH } from "@/app/redux/api/endpoints";
import type { WantedProfessionCreateI } from "@/shared/types/api/ForMyselfI";

export const meApi = createApi({
  reducerPath: "meApi",
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
    addWantedProfessions: build.mutation<void, WantedProfessionCreateI[] | WantedProfessionCreateI>({
      query: (body) => ({
        url: ME_WANTED_PROFESSION_ADD_PATH,
        method: "POST",
        body: Array.isArray(body) ? body : [body],
      }),
    }),
  }),
});

export const { useAddWantedProfessionsMutation } = meApi;
