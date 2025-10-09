import { Flex, Title, Image, Text, Button } from "@mantine/core";
import { useLogin } from "@/hooks/useLogin";
import { FormWrapper } from "@/components/form-wrapper/FormWrapper";
import { LoginForm } from "./components/LoginForm";
import { Link } from "react-router-dom";
import Logo from '@/assets/bgAuth.svg'

export const Authorization = () => {
  const { handleLogin } = useLogin();

  return (
    <FormWrapper formId="login">
      <Flex direction="column" align="center" justify="center" h="100%" gap="md">
        <Image src={Logo} alt="Pichta Logo" w={250} />
        <Title order={1} className="auth-title">
          Вход
        </Title>
        <LoginForm handleSubmit={handleLogin} />
        
        <Link to="/forgot-password" style={{ textDecoration: "none", marginTop: "0.5rem" }}>
          <Button variant="subtle" color="teal" size="xs">
            Забыли пароль?
          </Button>
        </Link>

        <Text className="registerPrompt">
          Ещё не зарегистрированы?{" "}
          <Link to="/register" className="registerLink">
            Зарегистрироваться!
          </Link>
        </Text>
      </Flex>
    </FormWrapper>
  );
};
