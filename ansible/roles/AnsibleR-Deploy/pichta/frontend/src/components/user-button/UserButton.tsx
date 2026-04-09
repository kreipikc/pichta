import { UnstyledButton, Group, Text, rem } from '@mantine/core';
import { IconChevronRight } from '@tabler/icons-react';
// @ts-ignore
import * as classes from './UserButton.module.css';

export function UserButton() {
    return (
        <UnstyledButton className={classes.user} onClick={() => {}}>
            <Group>
                <div style={{ flex: 1 }}>
                    <Text size="xl" fw={500}>
                        Name
                        Surname
                    </Text>
                    <Text c="dimmed" size="xl">
                        hspoonlicker@outlook.com
                    </Text>
                </div>
                <IconChevronRight style={{ width: rem(14), height: rem(14) }} stroke={1.5} />
            </Group>
        </UnstyledButton>
    );
}