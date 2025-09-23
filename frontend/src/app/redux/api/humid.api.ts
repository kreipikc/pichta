import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";

import {API_BASE_URL, HUMID_PATH} from "@/app/redux/api/endpoints";
import {GetHumid, PostCritHumid} from "@/shared/types/api/HumidI";

export const humidApi = createApi({
    reducerPath: "humidApi",
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
        getHumidAll: build.query<void, void>({
            query: ()=> ({
                url: `${HUMID_PATH}/all`,
            })
        }),
        getHumid: build.query<void, void>({
            query: ()=> ({
                url: `${HUMID_PATH}`,
            })
        }),
        postCritHumid: build.mutation<GetHumid, PostCritHumid>({
            query: (body: PostCritHumid) => ({
                url: `${HUMID_PATH}/crit`,
                method: "POST",
                body: body
            })
        }),
        getHumidAvg: build.query<void, void>({
            query: ()=> ({
                url: `${HUMID_PATH}/avg`,
            })
        }),

    })
})

export const {
    useGetHumidAllQuery,
    useGetHumidAvgQuery,
    useGetHumidQuery,
    usePostCritHumidMutation
} = humidApi