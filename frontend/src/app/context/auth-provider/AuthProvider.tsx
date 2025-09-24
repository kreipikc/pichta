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

// === env fallback ===
const EXPIRE_MINUTES_RAW = import.meta.env.VITE_ACCESS_TOKEN_EXPIRE_MINUTES ?? '15';
const EXPIRE_MINUTES = Number.isFinite(Number(EXPIRE_MINUTES_RAW)) ? Number(EXPIRE_MINUTES_RAW) : 15;
const LEEWAY_MS = 60_000; // запас 1 минута
const MIN_TIMEOUT_MS = 30_000; // минимум 30с

function parseJwtExpMs(token?: string | null): number | null {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try {
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    if (!payload?.exp) return null;
    return payload.exp * 1000;
  } catch {
    return null;
  }
}

const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [status, setStatus] = useState<AuthStatus>(AuthStatus.Initializing);
  const dispatch = useAppDispatch();
  const { addUser, deleteUser } = userActions;
  const navigate = useNavigate();
  const { paths } = useRoutes();

  const { data, isFetching } = useGetMeQuery();
  const [refreshToken] = useRefreshTokenMutation();
  const [logoutMutation] = useLogoutMutation();

  // setTimeout id
  const refreshTimeoutRef = useRef<number | null>(null);

  const clearRefreshTimeout = () => {
    if (refreshTimeoutRef.current) {
      window.clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = null;
    }
  };

  const scheduleNextRefresh = () => {
    clearRefreshTimeout();

    const accessToken = localStorage.getItem('access_token');
    const expMs = parseJwtExpMs(accessToken);

    let delay = MIN_TIMEOUT_MS;
    const now = Date.now();

    if (expMs && expMs > now) {
      delay = Math.max(expMs - now - LEEWAY_MS, MIN_TIMEOUT_MS);
    } else {
      delay = Math.max(EXPIRE_MINUTES * 60_000 - LEEWAY_MS, MIN_TIMEOUT_MS);
    }

    refreshTimeoutRef.current = window.setTimeout(async () => {
      await doRefresh();
    }, delay);
  };

  const doRefresh = async () => {
    try {
      await refreshToken().unwrap();
      scheduleNextRefresh();
    } catch {
      localStorage.removeItem('access_token');
      localStorage.removeItem('token_type');
      dispatch(deleteUser());
      setStatus(AuthStatus.Unauthenticated);
      clearRefreshTimeout();
    }
  };

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

  // Инициализация
  useEffect(() => {
    const init = async () => {
      try {
        const me = await getMeManually();
        if (me) {
          dispatch(addUser(me));
          setStatus(AuthStatus.Authenticated);
          scheduleNextRefresh();
          return;
        }
        const refreshed = await refreshToken().unwrap().catch(() => null);
        if (refreshed) {
          const meAfter = await getMeManually();
          if (meAfter) {
            dispatch(addUser(meAfter));
            setStatus(AuthStatus.Authenticated);
            scheduleNextRefresh();
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
  }, []);

  // Синхронизация user из кэша useGetMeQuery
  useEffect(() => {
    if (data) {
      dispatch(addUser(data as UserInfoI));
    }
  }, [data, dispatch, addUser]);

  // Управляем таймером в зависимости от статуса
  useEffect(() => {
    if (status === AuthStatus.Authenticated) {
      scheduleNextRefresh();
    } else {
      clearRefreshTimeout();
    }
    return () => clearRefreshTimeout();
  }, [status]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState !== 'visible') return;
      if (status !== AuthStatus.Authenticated) return;

      const accessToken = localStorage.getItem('access_token');
      const expMs = parseJwtExpMs(accessToken);
      if (!expMs) return;

      const now = Date.now();
      if (expMs - now < LEEWAY_MS * 2) {
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
        clearRefreshTimeout();
        navigate(paths.Auth);
      },
      fetchUser: async () => {
        const me = await getMeManually();
        if (me) dispatch(addUser(me));
      },
      setInitializing: () => setStatus(AuthStatus.Initializing),
      auth: () => {
        setStatus(AuthStatus.Authenticated);
        scheduleNextRefresh();
      },
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
