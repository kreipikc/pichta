import type { Middleware, AnyAction } from '@reduxjs/toolkit';
import { isRejectedWithValue } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';

type RejectedPayload = {
  status?: number;
  data?: {
    detail?:
      | string
      | {
          code?: string;
          reason?: string;
          message?: string;
        };
  };
};

function isSilentBadCreds(payload?: RejectedPayload) {
  const status = payload?.status;
  const detail = payload?.data?.detail as
    | string
    | { code?: string; reason?: string; message?: string }
    | undefined;

  // Если detail — строка, это не наш кейс
  if (typeof detail === 'string') return false;

  const code = detail?.code;
  const reason = String(detail?.reason ?? '').toLowerCase();

  return (
    (status === 401 || status === 403) &&
    code === 'BAD_CREDENTIALS' &&
    reason.includes('access token expires')
  );
}

export const errorToastMiddleware: Middleware =
  () => (next) => (action: AnyAction) => {
    if (isRejectedWithValue(action)) {
      // аккуратно сужаем тип payload
      const payload = (action as any).payload as RejectedPayload | undefined;

      // приглушаем авто-рефрешный кейс
      if (isSilentBadCreds(payload)) {
        return next(action);
      }

      const detail = payload?.data?.detail;

      let text: string | undefined;
      if (typeof detail === 'string') {
        text = detail;
      } else if (detail && typeof detail === 'object') {
        text = detail.reason || detail.message;
      }

      const finalText = text || 'Something went wrong';

      // системные сообщения не тостим
      if (
        finalText !== 'Could not validate credentials' &&
        finalText !== 'Not authenticated' &&
        finalText !== 'View can only your data'
      ) {
        console.log(finalText);
        toast.error(finalText);
      }
    }

    return next(action);
  };
