import { Flex, Title } from "@mantine/core";
import { useForgotPassword } from "@/hooks/useForgotPassword";
import { FormWrapper } from "@/components/form-wrapper/FormWrapper";
import { ForgotPasswordForm } from "./components/ForgotPasswordForm";

export const ForgotPassword = () => {
  const { sendResetLink, loading, error, success } = useForgotPassword();

  return (
    <FormWrapper formId="forgot-password">
      <Flex justify="center" align="center" direction="column" gap="md">
        <Title order={1} className="auth-title">
          Восстановление пароля
        </Title>
        <ForgotPasswordForm
          handleSubmit={sendResetLink}
          loading={loading}
          error={error}
          success={success}
        />
      </Flex>
    </FormWrapper>
  );
};
