import { MantineThemeOverride } from '@mantine/core'

export const theme: MantineThemeOverride = {
    colorScheme: 'light',
    colors: {
        __blue: [
            "#ebf1ff",
            "#d3defa",
            "#a1baf7",
            "#6c94f6",
            "#4574f5",
            "#3060f6",
            "#2656f7",
            "#1c47dc",
            "#133fc5",
            "#0035ad"
        ],
        __cyan: [
            "#e1faff",
            "#cbf0ff",
            "#9adeff",
            "#64cbff",
            "#3bbcfe",
            "#22b2fe",
            "#09adff",
            "#0097e4",
            "#0086cd",
            "#0075b5"
        ],
    },
    primaryColor: '__blue',
    white: '#fff',
    black: '#2C2A29',
    fontFamily: 'Verdana, sans-serif',
    fontFamilyMonospace: 'Monaco, Courier, monospace',
    headings: { fontFamily: 'Verdana, sans-serif', fontWeight: 500 },
    fontSizes: {
        xs: '0.6rem',
        sm: '0.75rem',
        md: '0.9rem',
        lg: '1rem',
        xl: '1.2rem',
    },
    components: {
        Button: {
            styles: {
                label: {
                    fontSize: '0.9rem',
                },
            },
        },
        AppShell: {
            styles: {
                main: {
                    padding: 0,
                },
            },
        },
    },
}