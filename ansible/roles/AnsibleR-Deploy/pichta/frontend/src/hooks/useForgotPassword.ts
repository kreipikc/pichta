import { useState } from "react";
import Cookies from "js-cookie";
import { useRoutes } from "@/hooks/useRoutes";
import { useNavigate } from "react-router-dom";

export const useForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();
  const { paths } = useRoutes();

  const sendResetLink = async (email: string) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Мокаем поведение отправки письма
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Сохраняем "сброшенный пароль" в куки (в целях демонстрации)
      Cookies.set("mock_password", `123456`);

      setSuccess("Ссылка на восстановление отправлена на ваш email");
      setTimeout(() => {
        navigate(paths.Auth);
      }, 2000);
    } catch (err) {
      setError("Ошибка при отправке ссылки. Попробуйте позже.");
    } finally {
      setLoading(false);
    }
  };

  return { sendResetLink, loading, error, success };
};
