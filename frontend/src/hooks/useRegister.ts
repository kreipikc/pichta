import { useCallback, useState } from 'react';
import { useRegisterMutation } from '@/app/redux/api/auth.api';
import { useRoutes } from '@/hooks/useRoutes';

export const useRegister = () => {
  const [registerMutation, { isLoading }] = useRegisterMutation();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { navigateTo } = useRoutes();

  const register = useCallback(async (formData: Record<string, any>) => {
    setError(null);
    try {
      const login = formData.login ?? formData.username ?? formData.email;
      const password = formData.password as string;
      if (!login || !password) throw new Error('Заполните логин и пароль');
      await registerMutation({ login, password }).unwrap();
      setSuccess(true);
      navigateTo.Auth();
    } catch (e: any) {
      setError(e?.message || 'Не удалось зарегистрироваться');
    }
  }, [registerMutation, navigateTo]);

  return { register, loading: isLoading, error, success };
};
