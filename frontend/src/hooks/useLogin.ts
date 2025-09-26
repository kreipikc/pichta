import { useCallback } from 'react';
import { toast } from 'react-toastify';
import type { LogInI } from '@/shared/types/api/UserI';
import { useSignInMutation } from '@/app/redux/api/auth.api';
import { useAuth } from '@/app/context/auth-provider/AuthProvider';
import { useNavigate } from 'react-router-dom';

export const useLogin = (): {
  handleLogin: (data: Partial<LogInI> & Record<string, any>) => Promise<void>;
  isLoading: boolean;
} => {
  const { auth } = useAuth(); // провайдер остаётся “истиной”
  const [signIn, { isLoading }] = useSignInMutation();
  const navigate = useNavigate();

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

        sessionStorage.setItem('pending_questionnaire_check', '1');

        await auth();
        navigate('/');
      } catch (e: any) {
        toast(e?.data?.detail || e?.data?.message || e?.message || 'Неверный логин или пароль');
      }
    },
    [signIn, auth, navigate]
  );

  return { handleLogin, isLoading };
};
