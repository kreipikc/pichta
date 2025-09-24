import type { MantineThemeOverride } from '@mantine/core'

export const theme: MantineThemeOverride = {
  colorScheme: 'light',
  primaryColor: 'teal',
  primaryShade: { light: 6, dark: 6 },

  colors: {
    __blue: [
      "#ebf1ff","#d3defa","#a1baf7","#6c94f6","#4574f5",
      "#3060f6","#2656f7","#1c47dc","#133fc5","#0035ad"
    ],
    __cyan: [
      "#e1faff","#cbf0ff","#9adeff","#64cbff","#3bbcfe",
      "#22b2fe","#09adff","#0097e4","#0086cd","#0075b5"
    ],
  },

  white: '#fff',
  black: '#2C2A29',

  fontFamily: `'InterVariable', Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'`,
  headings: {
    fontFamily: `'Manrope Variable', Manrope, Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial`,
    fontWeight: '700',
  },
  fontFamilyMonospace: `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace`,

  fontSizes: {
    xs: '0.6rem',
    sm: '0.75rem',
    md: '0.9rem',
    lg: '1rem',
    xl: '1.2rem',
  },

  components: {
    Button: {
      defaultProps: {
      },
      styles: {
        label: { fontSize: '0.9rem' },
      },
    },
    AppShell: {
      styles: {
        main: { padding: 0 },
      },
    },
  },
}
