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

  const redirectedRef = useRef(false);

  const [refreshToken] = useRefreshTokenMutation();
  const [logoutMutation] = useLogoutMutation();

  const currentUser = useAppSelector((s) => s.user.currentUser);

  // === /user/me ===
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

  // ===== ИНИЦИАЛИЗАЦИЯ БЕЗ ТАЙМЕРОВ =====
  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('access_token');
      const type = localStorage.getItem('token_type');

      // 1) если уже есть access — считаем аутентифицированным
      if (token && type) {
        setStatus(AuthStatus.Authenticated);
        return;
      }

      // 2) пробуем один раз обновить токен (по cookie refresh)
      try {
        const refreshed: any = await refreshToken().unwrap().catch(() => null);
        const access =
          refreshed?.access_token ?? refreshed?.accessToken ?? refreshed?.token ?? null;
        const tokenType = refreshed?.token_type ?? refreshed?.tokenType ?? 'Bearer';

        if (access) {
          localStorage.setItem('access_token', String(access));
          localStorage.setItem('token_type', String(tokenType));
          setStatus(AuthStatus.Authenticated);
          return;
        }
      } catch {
        // ignore — упадём в Unauthenticated ниже
      }

      setStatus(AuthStatus.Unauthenticated);
    };

    void init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      void refetch();
    },

    // Ручной рефреш по требованию (без расписаний).
    refresh: async () => {
      await refreshToken().unwrap().catch(() => {});
    },
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
