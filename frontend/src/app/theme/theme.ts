import { MantineThemeOverride } from '@mantine/core';

export const theme: MantineThemeOverride = {
  /** ВАЖНО: никаких __blue, __cyan и т.п. */
  primaryColor: 'teal',
  primaryShade: { light: 6, dark: 5 }, // опционально

  /** Базовые шрифты по желанию */
  fontFamily: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica, Arial, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol, "Noto Color Emoji", sans-serif',
  headings: { fontFamily: 'Inter, sans-serif', fontWeight: '700' },

  /** Дефолтные цвета для ключевых компонентов,
   *  чтобы НИГДЕ не всплывал blue по умолчанию
   */
  components: {
    Button: {
      defaultProps: { color: 'teal' },
    },
    ActionIcon: {
      defaultProps: { color: 'teal' },
    },
    Tabs: {
      defaultProps: { color: 'teal' },
    },
    Badge: {
      defaultProps: { color: 'teal' },
    },
    Checkbox: {
      defaultProps: { color: 'teal' },
    },
    Switch: {
      defaultProps: { color: 'teal' },
    },
    Progress: {
      defaultProps: { color: 'teal' },
    },
    Radio: {
      defaultProps: { color: 'teal' },
    },
    Slider: {
      defaultProps: { color: 'teal' },
    },
    // если используешь @mantine/dates
    DatePickerInput: {
      defaultProps: { color: 'teal' },
    },
    DateTimePicker: {
      defaultProps: { color: 'teal' },
    },
    Select: {
      defaultProps: { color: 'teal' },
    },
    SegmentedControl: {
      defaultProps: { color: 'teal' },
    },
  },
};
