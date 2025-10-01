import { fetchBaseQuery, FetchBaseQueryError, FetchArgs } from '@reduxjs/toolkit/query';
import type { BaseQueryFn } from '@reduxjs/toolkit/query';
import { API_BASE_URL, AUTH_REFRESH_PATH } from '@/app/redux/api/endpoints';

/**
 * Единый baseQuery с авто-рефрешем access_token
 * - Тригерится только на 401/403 с detail.code === 'BAD_CREDENTIALS'
 *   и reason, где встречается 'access token expires'
 * - Делает POST /auth/refresh_token, сохраняет новый токен и повторяет исходный запрос
 * - Сингл-флайт: параллельные запросы ждут один refresh
 */
type TokenResponse = { access_token: string; token_type?: string };

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  credentials: 'include',
  prepareHeaders: (headers) => {
    const token = localStorage.getItem('access_token');
    if (token) headers.set('authorization', `Bearer ${token}`);
    return headers;
  },
});

let refreshPromise: Promise<string | null> | null = null;

function needRefresh(error?: FetchBaseQueryError) {
  if (!error) return false;
  const status = (error as any)?.status;
  const detail = (error as any)?.data?.detail;
  if (typeof detail === 'string') return false;
  const code = detail?.code;
  const reason = String(detail?.reason ?? '').toLowerCase();
  return (status === 401 || status === 403)
    && code === 'BAD_CREDENTIALS'
    && reason.includes('access token expires');
}

async function runRefresh(api: any, extra: any): Promise<string | null> {
  const res = await rawBaseQuery({ url: AUTH_REFRESH_PATH, method: 'POST' }, api, extra);
  if ((res as any).error) {
    // refresh не удался — чистим и отдадим исходную ошибку
    localStorage.removeItem('access_token');
    localStorage.removeItem('token_type');
    return null;
  }
  const { access_token, token_type } = (res as any).data as TokenResponse;
  localStorage.setItem('access_token', access_token);
  if (token_type) localStorage.setItem('token_type', token_type);
  return access_token;
}

export const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  // 1) обычный запрос
  let result = await rawBaseQuery(args, api, extraOptions);

  // 2) если не наш кейс — вернуть как есть
  if (!needRefresh((result as any).error)) return result;

  // 3) один refresh для всех ожидающих
  if (!refreshPromise) {
    refreshPromise = runRefresh(api, extraOptions).finally(() => (refreshPromise = null));
  }
  const newToken = await refreshPromise;

  if (!newToken) {
    // refresh провалился — отдаем исходную ошибку
    return result;
  }

  // 4) повторяем исходный запрос
  result = await rawBaseQuery(args, api, extraOptions);
  return result;
};
