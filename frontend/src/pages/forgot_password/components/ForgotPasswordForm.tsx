import { FC } from "react";
import {
  Button,
  TextInput,
  Notification,
  Loader,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconCheck, IconX } from "@tabler/icons-react";

type ForgotPasswordFormProps = {
  handleSubmit: (email: string) => Promise<void>;
  loading: boolean;
  error: string | null;
  success: string | null;
};

export const ForgotPasswordForm: FC<ForgotPasswordFormProps> = ({
  handleSubmit,
  loading,
  error,
  success,
}) => {
  const form = useForm({
    initialValues: {
      email: "",
    },
    validate: {
      email: (value) =>
        /^\S+@\S+$/.test(value) ? null : "Введите корректный email",
    },
  });

  const onSubmit = async () => {
    await handleSubmit(form.values.email);
  };

  return (
    <form onSubmit={form.onSubmit(onSubmit)} style={{ width: "100%", maxWidth: 400 }}>
      <TextInput
        label="Email"
        placeholder="Введите вашу почту"
        withAsterisk
        {...form.getInputProps("email")}
      />

      {error && (
        <Notification color="red" icon={<IconX />} mt="md">
          {error}
        </Notification>
      )}

      {success && (
        <Notification color="teal" icon={<IconCheck />} mt="md">
          {success}
        </Notification>
      )}

      <Button fullWidth mt="lg" type="submit" color="teal" disabled={loading}>
        {loading ? <Loader size="xs" /> : "Отправить ссылку"}
      </Button>
    </form>
  );
};
