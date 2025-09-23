import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL, REFERENCE_HUMID_PATH, REFERENCE_TEMP_PATH, SENSORS_HUMID_PATH, SENSORS_TEMP_PATH } from '@/app/redux/api/endpoints';
import { SensorDataI } from '@/shared/types/api/SensorDataI'

// API для получения данных температурных датчиков
export const sensorsApi = createApi({
  reducerPath: 'sensorsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('access_token');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
    credentials: 'include',
  }),
  endpoints: (build) => ({
    getTempSensorsData: build.query<SensorDataI[], any>({
      query: (params) => ({
        url: SENSORS_TEMP_PATH,
        method: 'GET',
        params,
      }),
    }),
    getHumidSensorsData: build.query<SensorDataI[], any>({
      query: (params) => ({
        url: SENSORS_HUMID_PATH,
        method: 'GET',
        params,
      }),
    }),
    getTempReferenceData: build.query<SensorDataI[], any>({
      query: (params) => ({
        url: REFERENCE_TEMP_PATH,
        method: 'GET',
        params,
      }),
    }),
    getHumidReferenceData: build.query<SensorDataI[], any>({
      query: (params) => ({
        url: REFERENCE_HUMID_PATH,
        method: 'GET',
        params,
      }),
    }),
  }),
});

export const {
  useGetTempSensorsDataQuery,
  useGetHumidSensorsDataQuery,
  useGetTempReferenceDataQuery,
  useGetHumidReferenceDataQuery,
} = sensorsApi;
