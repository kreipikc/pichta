import { createContext, FC, ReactNode, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useGetMeQuery,
  useRefreshTokenMutation,
  useLogoutMutation,
  authApi,
} from '@/app/redux/api/auth.api';
import { userActions } from '@/app/redux/store/reducers/userSlice';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { useAppSelector } from '@/hooks/useAppSelector';
import { useRoutes } from '@/hooks/useRoutes';
import type { UserInfoI } from '@/shared/types/api/UserI';

enum AuthStatus {
  Initializing = 'Initializing',
  Authenticated = 'Authenticated',
  Unauthenticated = 'Unauthenticated',
}

interface AuthContextProps {
  initializing: boolean;
  authenticated: boolean;
  unauthenticated: boolean;
  login: () => void;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
  setInitializing: () => void;
  auth: () => void;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps>({} as AuthContextProps);

// === Настройки авто-рефреша из env ===
const EXPIRE_MINUTES_RAW = import.meta.env.VITE_ACCESS_TOKEN_EXPIRE_MINUTES ?? '15';
const EXPIRE_MINUTES = Number.isFinite(Number(EXPIRE_MINUTES_RAW))
  ? Number(EXPIRE_MINUTES_RAW)
  : 15;
const REFRESH_LEEWAY_MIN = 1; // минута
const REFRESH_INTERVAL_MS = Math.max((EXPIRE_MINUTES - REFRESH_LEEWAY_MIN) * 60_000, 30_000); // минимум 30с

const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [status, setStatus] = useState<AuthStatus>(AuthStatus.Initializing);
  const dispatch = useAppDispatch();
  const { addUser, deleteUser } = userActions;
  const user = useAppSelector((s) => s.user.currentUser);
  const navigate = useNavigate();
  const { paths } = useRoutes();

  const { data, isFetching } = useGetMeQuery();
  const [refreshToken] = useRefreshTokenMutation();
  const [logoutMutation] = useLogoutMutation();

  // id интервала, чтобы корректно чистить
  const refreshTimerRef = useRef<number | null>(null);

  // Ручной getMe через RTK initiate
  const getMeManually = async (): Promise<UserInfoI | null> => {
    try {
      const result = await dispatch(
        authApi.endpoints.getMe.initiate(undefined, { forceRefetch: true })
      ).unwrap();
      return result as UserInfoI;
    } catch {
      return null;
    }
  };

  // Единый вызов refresh + подстраховка на 401
  const doRefresh = async () => {
    try {
      await refreshToken().unwrap();
      // опционально можно дёрнуть getMe, если на бэке меняются клеймы
      // await getMeManually().then((me) => me && dispatch(addUser(me)));
    } catch {
      // если рефреш неудачный — приводим к "неавторизован"
      localStorage.removeItem('access_token');
      localStorage.removeItem('token_type');
      dispatch(deleteUser());
      setStatus(AuthStatus.Unauthenticated);
    }
  };

  // Инициализация: пробуем access, затем refresh
  useEffect(() => {
    const init = async () => {
      try {
        const me = await getMeManually();
        if (me) {
          dispatch(addUser(me));
          setStatus(AuthStatus.Authenticated);
          return;
        }
        const refreshed = await refreshToken().unwrap().catch(() => null);
        if (refreshed) {
          const meAfter = await getMeManually();
          if (meAfter) {
            dispatch(addUser(meAfter));
            setStatus(AuthStatus.Authenticated);
            return;
          }
        }
        dispatch(deleteUser());
        setStatus(AuthStatus.Unauthenticated);
      } catch {
        dispatch(deleteUser());
        setStatus(AuthStatus.Unauthenticated);
      }
    };
    void init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Синхронизация user из кэша useGetMeQuery
  useEffect(() => {
    if (data) {
      dispatch(addUser(data as UserInfoI));
    }
  }, [data, dispatch, addUser]);

  // Планировщик авто-рефреша
  useEffect(() => {
    // чистилка интервала
    const stop = () => {
      if (refreshTimerRef.current) {
        window.clearInterval(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
    };

    if (status === AuthStatus.Authenticated) {
      // первый «ранний» рефреш через REFRESH_INTERVAL_MS
      stop();
      refreshTimerRef.current = window.setInterval(() => {
        void doRefresh();
      }, REFRESH_INTERVAL_MS);
    } else {
      stop();
    }

    return () => stop();
  }, [status]);

  // Рефреш при возврате вкладки в фокус (если давно не обновлялись)
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible' && status === AuthStatus.Authenticated) {
        void doRefresh();
      }
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [status]);

  const value = useMemo<AuthContextProps>(
    () => ({
      initializing: status === AuthStatus.Initializing || isFetching,
      authenticated: status === AuthStatus.Authenticated,
      unauthenticated: status === AuthStatus.Unauthenticated,
      login: () => navigate(paths.Auth),
      logout: async () => {
        try {
          await logoutMutation().unwrap();
        } catch {}
        localStorage.removeItem('access_token');
        localStorage.removeItem('token_type');
        dispatch(deleteUser());
        setStatus(AuthStatus.Unauthenticated);
        navigate(paths.Auth);
      },
      fetchUser: async () => {
        const me = await getMeManually();
        if (me) dispatch(addUser(me));
      },
      setInitializing: () => setStatus(AuthStatus.Initializing),
      auth: () => setStatus(AuthStatus.Authenticated),
      refresh: async () => {
        await doRefresh();
      },
    }),
    [status, isFetching, navigate, paths.Auth, logoutMutation, dispatch, deleteUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

const useAuth = (): AuthContextProps => useContext(AuthContext);

export { AuthProvider, AuthContext, useAuth };
