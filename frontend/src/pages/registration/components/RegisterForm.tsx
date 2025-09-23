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
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone_number: "",
  });

  const form = useForm({
    validateInputOnBlur: true,
    initialValues: formData,
    validate: {
      email: (val) => (/^\S+@\S+$/.test(val) ? null : "Некорректный email"),
      password: (val) =>
        val.length >= 6 ? null : "Пароль должен быть не менее 6 символов",
    },
  });

  const onSubmit = async () => {
    await handleRegister(form.values);
  };

  useEffect(() => {
    if (success) {
      setTimeout(() => navigate("/auth/login"), 2000);
    }
  }, [success, navigate]);

  return (
    <form onSubmit={form.onSubmit(onSubmit)} style={{ width: "100%", maxWidth: 400 }}>
      <TextInput
        label="Имя"
        placeholder="Иван"
        withAsterisk
        {...form.getInputProps("name")}
      />
      <TextInput
        label="Email"
        placeholder="example@mail.ru"
        withAsterisk
        {...form.getInputProps("email")}
      />
      <PasswordInput
        label="Пароль"
        placeholder="*******"
        withAsterisk
        {...form.getInputProps("password")}
      />
      <TextInput
        label="Телефон"
        placeholder="+7 777 777 777"
        withAsterisk
        {...form.getInputProps("phone_number")}
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
