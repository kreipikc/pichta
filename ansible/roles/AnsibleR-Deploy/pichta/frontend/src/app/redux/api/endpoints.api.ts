import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL, TAG_ENDPOINTS_PATH } from "@/app/redux/api/endpoints";
import { EndpointI } from "@/shared/types/api/EndpointI";

export const tagEndpointsApi = createApi({
  reducerPath: "tagEndpointsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders(headers) {
      const token = localStorage.getItem("access_token");
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
    credentials: "include",
  }),
  endpoints: (build) => ({
    getAllTagEndpoints: build.query<EndpointI[], void>({
      query: () => ({
        url: TAG_ENDPOINTS_PATH,
        method: "GET",
      }),
    }),
  }),
});

export const { useGetAllTagEndpointsQuery } = tagEndpointsApi;
