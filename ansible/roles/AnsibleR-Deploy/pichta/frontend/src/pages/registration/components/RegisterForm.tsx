import { FC, useState, useEffect } from "react";
import {
  Button,
  PasswordInput,
  TextInput,
  Text,
  Loader,
  Notification,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconCheck, IconX } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";

type RegisterFormProps = {
  handleRegister: (data: any) => Promise<void>;
  loading: boolean;
  error: string | null;
  success: boolean;
};

export const RegisterForm: FC<RegisterFormProps> = ({
  handleRegister,
  loading,
  error,
  success,
}) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ login: "", password: "", confirmPassword: "" });

  const form = useForm({
    validateInputOnBlur: true,
    initialValues: formData,
    validate: {
    login: (val) => (val?.trim().length ? null : "Введите логин"),
    password: (val) =>
      val.length >= 6 ? null : "Пароль должен быть не менее 6 символов",
    confirmPassword: (val, values) =>
      val === values.password ? null : "Пароли не совпадают",
  },
});

  const onSubmit = async () => { await handleRegister({ login: form.values.login, password: form.values.password }); };

  useEffect(() => {
    if (success) {
      setTimeout(() => navigate("/auth/login"), 2000);
    }
  }, [success, navigate]);

  return (
    <form onSubmit={form.onSubmit(onSubmit)} style={{ width: "100%", maxWidth: 400 }}>
      <TextInput
        label="Логин"
        placeholder="Ваш логин"
        withAsterisk
        {...form.getInputProps("login")}
      />
            <PasswordInput
        label="Пароль"
        placeholder="*******"
        withAsterisk
        {...form.getInputProps("password")}
      />
      <PasswordInput
        label="Повторите пароль"
        placeholder="*******"
        withAsterisk
        {...form.getInputProps("confirmPassword")}
      />
{error && (
        <Notification color="red" icon={<IconX />} mt="md">
          {error}
        </Notification>
      )}

      {success && (
        <Notification color="teal" icon={<IconCheck />} mt="md">
          Регистрация успешна! Перенаправляем...
        </Notification>
      )}

      <Button fullWidth mt="lg" type="submit" color="teal" disabled={loading}>
        {loading ? <Loader size="xs" /> : "Зарегистрироваться"}
      </Button>
    </form>
  );
};
