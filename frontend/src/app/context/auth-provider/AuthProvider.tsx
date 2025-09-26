import { createContext, FC, ReactNode, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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

// --- анкета: правила завершённости ---
function isQuestionnaireCompleted(user: any): boolean {
  if (!user) return false;

  // 1) "О себе"
  const aboutOk = typeof user.about_me === 'string' && user.about_me.trim().length > 0;

  // 2) Навыки — разные варианты с сервера/стора
  const skillsCount =
    (Array.isArray(user.skills) ? user.skills.length : 0) ||
    (typeof user.skills_count === 'number' ? user.skills_count : 0) ||
    0;

  // 3) «Желаемые профессии» — разные варианты
  const wantedCount =
    (Array.isArray(user.wanted_professions) ? user.wanted_professions.length : 0) ||
    (Array.isArray(user.wanted) ? user.wanted.length : 0) ||
    (typeof user.wanted_count === 'number' ? user.wanted_count : 0) ||
    0;

  // Образование/опыт считаем опционально завершёнными (добавьте проверки при необходимости)
  return aboutOk && skillsCount > 0 && wantedCount > 0;
}

// Куда не редиректим из-под онбординга
const NEVER_REDIRECT = new Set<string>([
  '/questionnaire',
  '/auth/login',
  '/auth/register',
  '/auth/restore',
]);

const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [status, setStatus] = useState<AuthStatus>(AuthStatus.Initializing);
  const dispatch = useAppDispatch();
  const { addUser, deleteUser } = userActions;
  const navigate = useNavigate();
  const location = useLocation();
  const { paths } = useRoutes();

  const { data, isFetching } = useGetMeQuery();
  const [refreshToken] = useRefreshTokenMutation();
  const [logoutMutation] = useLogoutMutation();

  // user из стора — запасной источник
  const currentUser = useAppSelector((s) => s.user?.currentUser);

  // setTimeout id
  const refreshTimeoutRef = useRef<number | null>(null);
  const redirectedRef = useRef(false);

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
      // нормализация формата токенов от бэка
      const pickTokens = (t: any) => {
        if (!t) return null;
        const access =
          t.access_token ?? t.accessToken ?? t.token ?? t.access ?? null;
        const type = t.token_type ?? t.tokenType ?? 'Bearer';
        return access ? { access_token: String(access), token_type: String(type) } : null;
      };

      const saveTokens = (t: { access_token: string; token_type: string } | null) => {
        if (!t) return;
        localStorage.setItem('access_token', t.access_token);
        localStorage.setItem('token_type', t.token_type);
      };

      try {
        const me = await getMeManually();
        if (me) {
          dispatch(addUser(me));
          setStatus(AuthStatus.Authenticated);
          scheduleNextRefresh();
          return;
        }

        const refreshedRaw = await refreshToken().unwrap().catch(() => null);
        const refreshed = pickTokens(refreshedRaw);
        if (refreshed) {
          saveTokens(refreshed);

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

  // --- АНКЕТА: проверка и автопереход ---
  useEffect(() => {
    if (redirectedRef.current) return;
    if (status !== AuthStatus.Authenticated) return;

    // ждём, пока прилетит хоть какой-то user (из запроса или стора)
    const user = (data as any) || currentUser;
    if (!user) return;

    const path = location.pathname;
    if (NEVER_REDIRECT.has(path)) return;

    const needsOnboarding = !isQuestionnaireCompleted(user);
    const pendingCheck = sessionStorage.getItem('pending_questionnaire_check');

    // редиректим сразу после логина (флажок) ИЛИ если юзер идёт на главную/в профиль
    if (
      needsOnboarding &&
      (pendingCheck === '1' || path === '/' || path.startsWith('/user'))
    ) {
      redirectedRef.current = true;
      sessionStorage.removeItem('pending_questionnaire_check');
      navigate('/questionnaire', { replace: true });
    }
  }, [status, data, currentUser, location.pathname, navigate]);

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
        sessionStorage.removeItem('pending_questionnaire_check');
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
