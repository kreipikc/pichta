import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";

import {API_BASE_URL, TEMP_PATH} from "@/app/redux/api/endpoints";
import {GetTemp, PostCritTemp} from "@/shared/types/api/TempI";

export const tempApi = createApi({
    reducerPath: "tempApi",
    baseQuery: fetchBaseQuery({
        baseUrl: API_BASE_URL,
        prepareHeaders(headers) {
            const token = localStorage.getItem("access_token")
            if (token) {
                headers.set('authorization', `Bearer ${token}`)
            }
            return headers
        },
        credentials: 'include'
    }),
    endpoints: build => ({
        getTempAll: build.query<void, void>({
            query: ()=> ({
                url: `${TEMP_PATH}/all`,
            })
        }),
        getTemp: build.query<void, void>({
            query: ()=> ({
                url: `${TEMP_PATH}`,
            })
        }),
        postCritTemp: build.mutation<GetTemp, PostCritTemp>({
            query: (body: PostCritTemp) => ({
                url: `${TEMP_PATH}/crit`,
                method: "POST",
                body: body
            })
        }),
        getTempAvg: build.query<void, void>({
            query: ()=> ({
                url: `${TEMP_PATH}/avg`,
            })
        }),

    })
})

export const {
    useGetTempAllQuery,
    useGetTempAvgQuery,
    useGetTempQuery,
    usePostCritTempMutation,
} = tempApi