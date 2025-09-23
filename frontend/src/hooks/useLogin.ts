import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { LogInI } from "@/shared/types/api/UserI";
import Cookies from "js-cookie";
import { toast } from "react-toastify";

export const useLogin = () => {
  const navigate = useNavigate();

  const handleLogin = useCallback((data: LogInI) => {
    const savedUsername = Cookies.get("mock_username");
    const savedPassword = Cookies.get("mock_password");

    if (data.username === savedUsername && data.password === savedPassword) {
      const isFirstLogin = !Cookies.get("questionnaireResult");

      navigate(isFirstLogin ? "/questionnaire" : "/user/profile");
    } else {
      toast("Неверный логин или пароль");
    }
  }, [navigate]);

  return {
    handleLogin,
    isLoading: false,
  };
};
