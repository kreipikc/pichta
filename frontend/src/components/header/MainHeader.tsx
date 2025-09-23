import { Box, Button, Flex, Image } from "@mantine/core";
import { useNavigate, useLocation } from "react-router-dom";
import { useRoutes } from "@/hooks/useRoutes";
import logo from "@/assets/favicon.svg";
import styles from "./MainHeader.module.css";

export const MainHeader = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { paths } = useRoutes();

  const hideOnRoutes = ["/", "/register", "/forgot-password", "/questionnaire"];
  if (hideOnRoutes.includes(pathname)) return null;

  return (
    <Box component="header" className={styles.header}>
      <div className={styles.headerContent}>
        {/* Логотип */}
        <Image src={logo} alt="logo" className={styles.logo} />

        {/* Центрированные кнопки */}
        <div className={styles.centerNav}>
          <Button variant="subtle" color="teal" onClick={() => navigate(paths.UserProfile)}>
            Профиль
          </Button>
          <Button variant="subtle" color="teal" onClick={() => navigate(paths.Graph)}>
            Граф навыков
          </Button>
          <Button variant="subtle" color="teal" onClick={() => navigate(paths.GanttChart)}>
            Диаграмма Гантта
          </Button>
        </div>

        {/* Плейсхолдер справа */}
        <div className={styles.placeholder}></div>
      </div>
    </Box>
  );
};
