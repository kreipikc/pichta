import React, { useEffect, useState } from "react";
import {Box, Flex, Text, NavLink} from "@mantine/core";
import { useRoutes } from "@/hooks/useRoutes";
import { useLocation, useNavigate } from "react-router-dom";

export const NavigationMenu = () => {
    const [active, setActive] = useState("");
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const { paths } = useRoutes();

    useEffect(() => {
        const foundPage = Object.values(paths).find((path) => path === pathname);
        setActive(foundPage ? foundPage : "");
    }, [pathname, paths]);

    const navigateTo = (value: string) => {
        setActive(value);
        navigate(value);
    };

    const items = Object.entries(paths).map(([key, value]) => (
        <NavLink
            key={key}
            active={active === value}
            label={
                <Text size="xl">{key}</Text>}
            onClick={() => navigateTo(value)}
        />
    ));

    return (
        <Flex justify={"center"}>
            <Box w="100%">{items}</Box>
        </Flex>
    );
};
