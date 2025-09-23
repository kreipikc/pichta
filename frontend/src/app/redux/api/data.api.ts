import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { ALL_DATA_PATH, API_BASE_URL, DATA_COUNT_PATH, DATA_EXPORT_PATH, DATA_IMPORT_PATH } from '@/app/redux/api/endpoints';

// Интерфейс данных для ручки data/count/all
interface PaletLog {
  id_rpi: number;
  id_palet: number;
  id_trip: string;
}

export const dataApi = createApi({
  reducerPath: 'dataApi',
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
  endpoints: (builder) => ({
    getAllPaletIds: builder.query<PaletLog[], void>({
      query: () => ({
        url: ALL_DATA_PATH,
        method: 'GET',
      }),
    }),
    deleteData: builder.mutation({
      query: ({ query }) => ({
        url: DATA_COUNT_PATH,
        method: 'DELETE',
        params: query,
      }),
    }),
    createData: builder.mutation({
      query: ({ query }) => ({
        url: DATA_COUNT_PATH,
        method: 'POST',
        params: query,
      }),
    }),
    uploadFile: builder.mutation<void, FormData>({
      query: (formData) => ({
        url: DATA_IMPORT_PATH, // Убедитесь, что путь правильный
        method: "POST",
        body: formData, // Отправка данных формы
      }),
    }),
    exportData: builder.mutation<any, void>({
      query: () => ({
        url: DATA_EXPORT_PATH,
        method: 'GET',
        responseHandler: (response) => response.blob(), // Возвращает blob
      }),
    }),
  }),
});

export const {
  useGetAllPaletIdsQuery,
  useDeleteDataMutation,
  useCreateDataMutation,
  useExportDataMutation,
  useUploadFileMutation,
} = dataApi;
