import { Box } from "@mantine/core";
import { NavigationMenu } from "@/components/navigation/NavigationMenu";
import { UserButton } from "@/components/user-button/UserButton";
import React from "react";

export const NavigationComponent = () => {
  return (
    <Box p="xs" h="100%" display="flex" style={{ flexDirection: "column", justifyContent: "space-between" }}>
      <NavigationMenu />
      <UserButton />
    </Box>
  );
};
