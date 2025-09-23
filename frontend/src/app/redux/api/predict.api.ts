import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL, PREDICT_PATH } from '@/app/redux/api/endpoints';
import { PredictDataI } from '@/shared/types/api/PredictI'

export const predictApi = createApi({
    reducerPath: 'predictApi',
    baseQuery: fetchBaseQuery({
        baseUrl: API_BASE_URL,
        prepareHeaders(headers) {
            const token = localStorage.getItem('access_token');
            if (token) {
                headers.set('authorization', `Bearer ${token}`);
            }
            return headers;
        },
        credentials: 'include',
    }),
    endpoints: (builder) => ({
        getPredictData: builder.query<PredictDataI[], {
            offset_pages?: number;
            id_rpi?: number;
            id_palet?: number;
            id_trip?: string;
            date_from?: string;
            date_to?: string;
        }>({
            query: ({ offset_pages, id_rpi, id_palet, id_trip, date_from, date_to }) => ({
                url: PREDICT_PATH,
                params: { offset_pages, id_rpi, id_palet, id_trip, date_from, date_to },
                method: 'GET',
            }),
        }),
    }),
});

export const { useGetPredictDataQuery } = predictApi;

