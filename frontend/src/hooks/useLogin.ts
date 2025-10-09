import { useCallback } from 'react';
import { toast } from 'react-toastify';
import type { LogInI } from '@/shared/types/api/UserI';
import { useSignInMutation, authApi } from '@/app/redux/api/auth.api';
import { useAuth } from '@/app/context/auth-provider/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { userActions } from '@/app/redux/store/reducers/userSlice';

export const useLogin = (): {
  handleLogin: (data: Partial<LogInI> & Record<string, any>) => Promise<void>;
  isLoading: boolean;
} => {
  const { auth } = useAuth();
  const [signIn, { isLoading }] = useSignInMutation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { deleteUser } = userActions;

  const handleLogin = useCallback(
    async (data: Partial<LogInI> & Record<string, any>) => {
      try {
        const login = (data.login ?? data.username ?? data.email ?? '').trim();
        const password = String(data.password ?? '');
        if (!login || !password) throw new Error('Введите логин и пароль');

        const resp = await signIn({ login, password }).unwrap();

        const token = (resp as any)?.access_token;
        const tokenType = (resp as any)?.token_type;

        if (token) localStorage.setItem('access_token', token);
        if (tokenType) localStorage.setItem('token_type', tokenType);

        // Полностью сбрасываем кэш, чтобы нигде не осталось данных прошлого юзера
        dispatch(authApi.util.resetApiState());
        dispatch(deleteUser());

        // Флажок для онбординга
        sessionStorage.setItem('pending_questionnaire_check', '1');

        // Отмечаем сессию и даём единственный refetch /me внутри AuthProvider
        await auth();

        // Переходим на корень — AuthProvider сам увезёт на /questionnaire при необходимости
        navigate('/');
      } catch (e: any) {
        toast(e?.data?.detail || e?.data?.message || e?.message || 'Неверный логин или пароль');
      }
    },
    [signIn, auth, navigate, dispatch, deleteUser]
  );

  return { handleLogin, isLoading };
};
