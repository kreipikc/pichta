import { BrowserRouter as Router } from "react-router-dom";
import { MantineProvider } from "@mantine/core";
import { DatesProvider } from "@mantine/dates";
import { AppRoutes } from "@/app/routes/AppRoutes";
import "react-toastify/dist/ReactToastify.css";
import { Provider } from "react-redux";
import { setupStore } from "@/app/redux/store";
import { AuthProvider } from "./context/auth-provider/AuthProvider";
import { useLocalStorage } from "@mantine/hooks";
import { theme } from "@/app/theme/theme";
import 'dayjs/locale/ru';

const store = setupStore();

const App = () => {
  const [colorScheme, setColorScheme] = useLocalStorage<'light' | 'dark'>({
    key: 'color-scheme',
    defaultValue: 'light',
  });

  // Если нужно где-то дергать:
  // const toggleColorScheme = () =>
  //   setColorScheme(colorScheme === 'dark' ? 'light' : 'dark');

  return (
    <MantineProvider theme={theme} defaultColorScheme={colorScheme}>
      <DatesProvider
        settings={{
          locale: 'ru',
          firstDayOfWeek: 1,
          weekendDays: [0, 6],
        }}
      >
        <Provider store={store}>
          <Router>
            <AuthProvider>
              <AppRoutes />
            </AuthProvider>
          </Router>
        </Provider>
      </DatesProvider>
    </MantineProvider>
  );
};

export default App;
