import { createContext, FC, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useGetMeQuery,
  useRefreshTokenMutation,
  useLogoutMutation,
  // 👇 добавили сам объект API, чтобы вызывать .endpoints.getMe.initiate
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

const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [status, setStatus] = useState<AuthStatus>(AuthStatus.Initializing);
  const dispatch = useAppDispatch();
  const { addUser, deleteUser } = userActions;
  const user = useAppSelector((s) => s.user.currentUser);
  const navigate = useNavigate();
  const { paths } = useRoutes();

  // подписка на состояние и кэш
  const { data, isFetching } = useGetMeQuery();

  const [refreshToken] = useRefreshTokenMutation();
  const [logoutMutation] = useLogoutMutation();

  // Хелпер: ручной getMe через dispatch + unwrap
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

  useEffect(() => {
    const init = async () => {
      try {
        // 1) Пробуем текущим access-токеном
        const me = await getMeManually();
        if (me) {
          dispatch(addUser(me));
          setStatus(AuthStatus.Authenticated);
          return;
        }

        // 2) Рефрешим и пробуем ещё раз
        const refreshed = await refreshToken().unwrap().catch(() => null);
        if (refreshed) {
          const meAfter = await getMeManually();
          if (meAfter) {
            dispatch(addUser(meAfter));
            setStatus(AuthStatus.Authenticated);
            return;
          }
        }

        // 3) Гость
        dispatch(deleteUser());
        setStatus(AuthStatus.Unauthenticated);
      } catch {
        dispatch(deleteUser());
        setStatus(AuthStatus.Unauthenticated);
      }
    };
    void init();
  }, []);

  useEffect(() => {
    if (data) {
      dispatch(addUser(data as UserInfoI));
    }
  }, [data, dispatch, addUser]);

  const value = useMemo<AuthContextProps>(() => ({
    initializing: status === AuthStatus.Initializing || isFetching,
    authenticated: status === AuthStatus.Authenticated,
    unauthenticated: status === AuthStatus.Unauthenticated,
    login: () => navigate(paths.Auth),
    logout: async () => {
      await logoutMutation().unwrap().catch(() => {});
      localStorage.removeItem('access_token');
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
    refresh: async () => { await refreshToken().unwrap().catch(() => {}); },
  }), [status, isFetching, navigate, paths.Auth, logoutMutation, dispatch, deleteUser, refreshToken]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

const useAuth = (): AuthContextProps => useContext(AuthContext);

export { AuthProvider, AuthContext, useAuth };
