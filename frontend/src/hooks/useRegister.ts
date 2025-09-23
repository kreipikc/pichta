import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

export const useRegister = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const register = useCallback(async (formData: any) => {
    setLoading(true);
    try {
      Cookies.set("mock_username", formData.email || formData.username);
      Cookies.set("mock_password", formData.password);
      Cookies.set("mock_name", formData.name || "User");

      setSuccess(true);
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (e) {
      setError("Не удалось зарегистрироваться");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  return { register, loading, error, success };
};
