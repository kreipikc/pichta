import { FC } from "react";
import { Button, PasswordInput, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { LogInI } from "@/shared/types/api/UserI";

type LoginFormProps = {
  handleSubmit: (data: LogInI) => void;
};

export const LoginForm: FC<LoginFormProps> = ({ handleSubmit }) => {
  const form = useForm({
    validateInputOnBlur: true,
    initialValues: {
      username: "",
      password: "",
    },
  });

  return (
    <form onSubmit={form.onSubmit(handleSubmit)} style={{ width: "100%", maxWidth: 360 }}>
      <TextInput
        withAsterisk
        label="Логин"
        placeholder="Ваш логин"
        type="text"
        mb="md"
        {...form.getInputProps("username")}
      />
      <PasswordInput
        withAsterisk
        label="Пароль"
        placeholder="Ваш пароль"
        mb="md"
        {...form.getInputProps("password")}
      />
      <Button fullWidth type="submit" color="teal" mt="md">
        Войти
      </Button>
    </form>
  );
};
