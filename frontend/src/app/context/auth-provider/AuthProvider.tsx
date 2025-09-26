import {
  createContext,
  FC,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  useGetMeQuery,
  useRefreshTokenMutation,
  useLogoutMutation,
  authApi,
} from '@/app/redux/api/auth.api';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { useAppSelector } from '@/hooks/useAppSelector';
import { userActions } from '@/app/redux/store/reducers/userSlice';
import { useRoutes } from '@/hooks/useRoutes';
import type { UserInfoI } from '@/shared/types/api/UserI';
import { useGetWantedProfessionsByUserIdQuery } from '@/app/redux/api/me.api';

// === Тайминги рефреша ===
const EXPIRE_MINUTES_RAW = String(import.meta.env.VITE_ACCESS_TOKEN_EXPIRE_MINUTES ?? '15').trim();
const ACCESS_EXPIRE_MIN = Number.isFinite(+EXPIRE_MINUTES_RAW) && +EXPIRE_MINUTES_RAW > 0
  ? +EXPIRE_MINUTES_RAW
  : 15;

const LEEWAY_MS = 60_000;     // 1 минута до истечения
const MIN_TIMEOUT_MS = 15_000; // минимум на всякий

enum AuthStatus {
  Initializing = 'initializing',
  Authenticated = 'authenticated',
  Unauthenticated = 'unauthenticated',
}

type AuthContextProps = {
  initializing: boolean;
  authenticated: boolean;
  unauthenticated: boolean;
  login: () => void;
  logout: () => Promise<void>;
  fetchUser: () => Promise<UserInfoI | null>;
  setInitializing: () => void;
  auth: () => void;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextProps>({} as AuthContextProps);

// utils
function parseJwtExpMs(token?: string | null): number | null {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try {
    let base = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    while (base.length % 4) base += '=';
    const payload = JSON.parse(atob(base));
    const expSec = payload?.exp;
    if (!expSec || !Number.isFinite(expSec)) return null;
    return expSec * 1000;
  } catch {
    return null;
  }
}

// страницы, куда не редиректим из онбординга
const NEVER_REDIRECT = new Set<string>([
  '/questionnaire',
  '/auth/login',
  '/auth/register',
  '/auth/restore',
]);

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [status, setStatus] = useState<AuthStatus>(AuthStatus.Initializing);

  const dispatch = useAppDispatch();
  const { addUser, deleteUser } = userActions;

  const navigate = useNavigate();
  const location = useLocation();
  const { paths } = useRoutes();

  const refreshTimeoutRef = useRef<number | null>(null);
  const redirectedRef = useRef(false);

  const [refreshToken] = useRefreshTokenMutation();
  const [logoutMutation] = useLogoutMutation();

  const currentUser = useAppSelector((s) => s.user.currentUser);

  // === единый /user/me ===
  const hasToken = !!localStorage.getItem('access_token');
  const shouldQueryMe = status === AuthStatus.Authenticated && hasToken;

  const {
    data: me,
    isFetching: isMeFetching,
    refetch,
  } = useGetMeQuery(undefined, {
    skip: !shouldQueryMe,
    refetchOnMountOrArgChange: false,
    refetchOnFocus: false,
    refetchOnReconnect: false,
    pollingInterval: 0,
  });

  // id пользователя
  const userId = (me?.id ?? currentUser?.id) as number | undefined;

  // === wanted professions для онбординга ===
  const {
    data: wantedProfs,
    isFetching: isWantedFetching,
  } = useGetWantedProfessionsByUserIdQuery(userId!, {
    skip: !userId,
    refetchOnFocus: false,
    refetchOnReconnect: false,
    pollingInterval: 0,
  });

  // Пишем me в стор
  useEffect(() => {
    if (me) dispatch(addUser(me));
  }, [me, dispatch, addUser]);

  // таймеры
  const clearRefreshTimeout = () => {
    if (refreshTimeoutRef.current) {
      window.clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = null;
    }
  };

  const scheduleNextRefresh = () => {
    clearRefreshTimeout();

    const accessToken = localStorage.getItem('access_token');
    const now = Date.now();
    const expMs = parseJwtExpMs(accessToken);

    let delay: number;
    if (typeof expMs === 'number' && expMs > now) {
      delay = Math.max(MIN_TIMEOUT_MS, expMs - now - LEEWAY_MS);
    } else {
      delay = Math.max(MIN_TIMEOUT_MS, ACCESS_EXPIRE_MIN * 60_000 - LEEWAY_MS);
    }
    if (!Number.isFinite(delay) || delay < MIN_TIMEOUT_MS) delay = MIN_TIMEOUT_MS;

    refreshTimeoutRef.current = window.setTimeout(async () => {
      try {
        await refreshToken().unwrap();
      } catch {
        localStorage.removeItem('access_token');
        localStorage.removeItem('token_type');
        setStatus(AuthStatus.Unauthenticated);
        dispatch(authApi.util.resetApiState());
        dispatch(deleteUser());
        return;
      }
      scheduleNextRefresh();
    }, delay) as unknown as number;
  };

  // инициализация
  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('access_token');
      const type = localStorage.getItem('token_type');

      if (token && type) {
        setStatus(AuthStatus.Authenticated);
        scheduleNextRefresh();
        return;
      }

      try {
        const refreshed: any = await refreshToken().unwrap().catch(() => null);
        const access =
          refreshed?.access_token ?? refreshed?.accessToken ?? refreshed?.token ?? null;
        const tokenType = refreshed?.token_type ?? refreshed?.tokenType ?? 'Bearer';
        if (access) {
          localStorage.setItem('access_token', String(access));
          localStorage.setItem('token_type', String(tokenType));
          setStatus(AuthStatus.Authenticated);
          scheduleNextRefresh();
          return;
        }
      } catch { /* ignore */ }

      setStatus(AuthStatus.Unauthenticated);
    };

    void init();
    return () => clearRefreshTimeout();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // мягкий рефреш при возврате вкладки (если < 1 мин)
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState !== 'visible') return;
      if (status !== AuthStatus.Authenticated) return;

      const expMs = parseJwtExpMs(localStorage.getItem('access_token'));
      const now = Date.now();
      if (expMs && expMs - now < LEEWAY_MS) {
        void refreshToken();
        scheduleNextRefresh();
      }
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [status, refreshToken]);

  // --- редирект в анкету: простое правило по wantedProfs ---
  useEffect(() => {
    if (redirectedRef.current) return;
    if (status !== AuthStatus.Authenticated) return;

    // ждём окончания загрузки me и wanted
    if (isMeFetching || isWantedFetching) return;

    const path = location.pathname;
    if (NEVER_REDIRECT.has(path)) return;

    const wantedCount = Array.isArray(wantedProfs) ? wantedProfs.length : 0;
    const needsOnboarding = wantedCount === 0;

    if (needsOnboarding) {
      redirectedRef.current = true;
      navigate('/questionnaire', { replace: true });
    }
  }, [
    status,
    isMeFetching,
    isWantedFetching,
    wantedProfs,
    location.pathname,
    navigate,
  ]);

  // публичное API
  const value = useMemo<AuthContextProps>(() => ({
    initializing: status === AuthStatus.Initializing || isMeFetching || isWantedFetching,
    authenticated: status === AuthStatus.Authenticated,
    unauthenticated: status === AuthStatus.Unauthenticated,

    login: () => navigate(paths.Auth),

    logout: async () => {
      try { await logoutMutation().unwrap(); } catch {}
      localStorage.removeItem('access_token');
      localStorage.removeItem('token_type');

      dispatch(authApi.util.resetApiState());
      dispatch(deleteUser());

      setStatus(AuthStatus.Unauthenticated);
      clearRefreshTimeout();
      navigate(paths.Auth);
    },

    fetchUser: async () => {
      try {
        const res = await refetch().unwrap();
        if (res) dispatch(addUser(res));
        return (res ?? null) as UserInfoI | null;
      } catch {
        return null;
      }
    },

    setInitializing: () => setStatus(AuthStatus.Initializing),

    auth: () => {
      setStatus(AuthStatus.Authenticated);
      scheduleNextRefresh();
      void refetch();
    },

    refresh: async () => { await refreshToken().unwrap().catch(() => {}); },
  }), [
    status,
    isMeFetching,
    isWantedFetching,
    navigate,
    paths.Auth,
    logoutMutation,
    dispatch,
    deleteUser,
    addUser,
    refetch,
    refreshToken,
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextProps => useContext(AuthContext);
