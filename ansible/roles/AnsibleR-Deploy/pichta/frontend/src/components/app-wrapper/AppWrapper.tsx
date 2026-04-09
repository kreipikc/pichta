import React, { FC, ReactNode } from "react";
import { AppShell, Container } from "@mantine/core";
import { useLocation } from "react-router-dom";
import { useDisclosure } from "@mantine/hooks";
import { MainHeader } from "@/components/header/MainHeader";

export const AppWrapper: FC<{ children: ReactNode }> = ({ children }) => {
  const [opened, { toggle }] = useDisclosure();

  return (
    <Container fluid px={0}>
      <MainHeader />
      <AppShell padding="md" withBorder={false}>
        {children}
      </AppShell>
    </Container>
  );
};
