import { Flex, Title, Image } from "@mantine/core";
import { useRegister } from "@/hooks/useRegister";
import { FormWrapper } from "@/components/form-wrapper/FormWrapper";
import { RegisterForm } from "./components/RegisterForm";
import Logo from '@/assets/bgAuth.svg'

export const Registration = () => {
  const { register, loading, error, success } = useRegister();

  return (
    <FormWrapper formId="register">
      <Flex direction="column" align="center" justify="center" h="100%" gap="md">
        <Image src={Logo} alt="Pichta Logo" w={250} />
        <Title order={1} className="auth-title">
          Регистрация
        </Title>
        <RegisterForm
          handleRegister={register}
          loading={loading}
          error={error}
          success={success}
        />
      </Flex>
    </FormWrapper>
  );
};
