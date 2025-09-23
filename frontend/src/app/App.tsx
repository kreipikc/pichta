import { BrowserRouter as Router } from "react-router-dom";
import { MantineProvider } from "@mantine/core";
import { AppRoutes } from "@/app/routes/AppRoutes";
import "react-toastify/dist/ReactToastify.css";
import { useState } from "react";
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

  const toggleColorScheme = () =>
    setColorScheme(colorScheme === 'dark' ? 'light' : 'dark');

  return (
    <MantineProvider defaultColorScheme={colorScheme}>
      <Provider store={store}>
        <Router>
          <AppRoutes />
        </Router>
      </Provider>
    </MantineProvider>
  );
};

export default App;
