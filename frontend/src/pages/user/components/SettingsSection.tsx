import { useState } from "react";
import {
  Card,
  Select,
  Switch,
  Group,
  Divider,
  Button,
  Stack,
  Modal,
  PasswordInput,
  Text,
} from "@mantine/core";
import { useRoutes } from "@/hooks/useRoutes";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { useForm } from "@mantine/form";
import { useAuth } from '@/app/context/auth-provider/AuthProvider';

export default function SettingsSection() {
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [language, setLanguage] = useState("ru");
  const { paths } = useRoutes();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [modalOpened, setModalOpened] = useState(false);
  const [changeSuccess, setChangeSuccess] = useState(false);

  const form = useForm({
    initialValues: {
      current: "",
      new: "",
    },
    validate: {
      current: (value) => (!value ? "Введите текущий пароль" : null),
      new: (value) => (value.length < 6 ? "Минимум 6 символов" : null),
    },
  });

  const handleSave = () => {
    console.log("Настройки сохранены", {
      darkMode,
      notifications,
      language,
    });
  };

  const handleLogout = () => {
    logout();
  };

  const handleChangePassword = (values: { current: string; new: string }) => {
    const stored = Cookies.get("mock_password");
    if (values.current !== stored) {
      form.setFieldError("current", "Неверный текущий пароль");
      return;
    }

    Cookies.set("mock_password", values.new, { expires: 30 });
    setChangeSuccess(true);
    setTimeout(() => {
      setModalOpened(false);
      form.reset();
      setChangeSuccess(false);
    }, 1500);
  };

  return (
    <>
      <Card withBorder className="settings-card">
        <h2 className="section-title">Настройки</h2>

        <div className="settings-group">
          <Group justify="space-between">
            <span className="settings-label">Тёмная тема</span>
            <Switch
              checked={darkMode}
              onChange={(event) => setDarkMode(event.currentTarget.checked)}
              color="teal"
            />
          </Group>

          <Divider my="sm" />

          <Group justify="space-between">
            <span className="settings-label">Уведомления</span>
            <Switch
              checked={notifications}
              onChange={(e) => setNotifications(e.currentTarget.checked)}
              color="teal"
            />
          </Group>

          <Divider my="sm" />

          <Group justify="space-between">
            <span className="settings-label">Язык интерфейса</span>
            <Select
              data={[
                { value: "ru", label: "Русский" },
                { value: "en", label: "English" },
              ]}
              value={language}
              onChange={(val) => setLanguage(val || "ru")}
              className="settings-select"
            />
          </Group>

          <Divider my="md" />

          <Stack>
            <Button fullWidth color="teal" onClick={handleSave}>
              Сохранить настройки
            </Button>

            <Button fullWidth color="teal" onClick={() => setModalOpened(true)}>
              Изменить пароль
            </Button>

            <Button fullWidth color="red" variant="outline" onClick={handleLogout}>
              Выйти
            </Button>
          </Stack>
        </div>
      </Card>

      <Modal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        title="Изменить пароль"
        centered
      >
        <form onSubmit={form.onSubmit(handleChangePassword)}>
          <PasswordInput
            label="Текущий пароль"
            placeholder="Введите текущий"
            {...form.getInputProps("current")}
            mb="md"
          />

          <PasswordInput
            label="Новый пароль"
            placeholder="Введите новый"
            {...form.getInputProps("new")}
            mb="md"
          />

          {changeSuccess && (
            <Text color="green" size="sm" mb="sm">
              Пароль успешно изменён
            </Text>
          )}

          <Button type="submit" fullWidth color="teal">
            Сохранить
          </Button>
        </form>
      </Modal>
    </>
  );
}
