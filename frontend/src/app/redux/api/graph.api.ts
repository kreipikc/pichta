import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseQuery";
import { GRAPH_GET_PATH } from "@/app/redux/api/endpoints";
import type { GraphResponseI } from "@/shared/types/api/GraphI";

export const graphApi = createApi({
  reducerPath: "graphApi",
  baseQuery: baseQueryWithReauth,
  endpoints: (build) => ({
    getGraphByProfession: build.query<GraphResponseI, { profId: number; userId: number }>({
      query: ({ profId, userId }) => ({
        url: `${GRAPH_GET_PATH}/${profId}`,
        method: "GET",
        params: { user_id: userId },
      }),
    }),
  }),
});

export const { useGetGraphByProfessionQuery } = graphApi;
