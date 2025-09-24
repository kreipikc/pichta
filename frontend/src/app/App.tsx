import { BrowserRouter as Router } from "react-router-dom";
import { MantineProvider } from "@mantine/core";
import { AppRoutes } from "@/app/routes/AppRoutes";
import "react-toastify/dist/ReactToastify.css";
import { Provider } from "react-redux";
import { setupStore } from "@/app/redux/store";
import { AuthProvider } from "./context/auth-provider/AuthProvider";
import { useLocalStorage } from "@mantine/hooks";

const store = setupStore();

const App = () => {
  const [colorScheme, setColorScheme] = useLocalStorage<'light' | 'dark'>({
    key: 'color-scheme',
    defaultValue: 'light',
  });

  return (
    <MantineProvider
      defaultColorScheme="light"
      forceColorScheme={colorScheme}
    >
      <Provider store={store}>
        <Router>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </Router>
      </Provider>
    </MantineProvider>
  );
};

export default App;
