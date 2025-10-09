import { useMemo, useState, forwardRef } from 'react';
import { Popover, TextInput, Group, Button, Box } from '@mantine/core';
import { DatePicker, TimeInput } from '@mantine/dates';
import { IconCalendar, IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';

type CommonProps = {
  kind?: 'date' | 'datetime';
  value: Date | null;
  onChange: (value: Date | null) => void;
  label?: string;
  placeholder?: string;
  clearable?: boolean;
  disabled?: boolean;
  required?: boolean;
  error?: string | boolean;
  minDate?: Date;
  maxDate?: Date;
  dropdownWidth?: number;
  id?: string;
};

export type AppDateFieldProps = CommonProps;

export const AppDateField = forwardRef<HTMLButtonElement, AppDateFieldProps>(
  (
    {
      kind = 'date',
      value,
      onChange,
      label,
      placeholder,
      clearable = true,
      disabled,
      required,
      error,
      minDate,
      maxDate,
      dropdownWidth = 320,
      id,
    },
    _ref
  ) => {
    const [opened, setOpened] = useState(false);

    const display = useMemo(() => {
      if (!value) return '';
      return dayjs(value).locale('ru').format(kind === 'date' ? 'DD.MM.YYYY' : 'DD.MM.YYYY HH:mm');
    }, [value, kind]);

    const timeHH = value ? dayjs(value).hour() : 0;
    const timeMM = value ? dayjs(value).minute() : 0;

    const setToday = () => {
      const now = new Date();
      if (kind === 'date') {
        onChange(new Date(now.getFullYear(), now.getMonth(), now.getDate()));
      } else {
        onChange(new Date());
      }
      setOpened(false);
    };

    const handleDaySelect = (d: Date | null) => {
      if (!d) {
        onChange(null);
        return;
      }
      if (kind === 'date') {
        onChange(new Date(d.getFullYear(), d.getMonth(), d.getDate()));
        setOpened(false);
      } else {
        const base = value ?? new Date();
        onChange(
          new Date(d.getFullYear(), d.getMonth(), d.getDate(), base.getHours(), base.getMinutes(), 0, 0)
        );
      }
    };

    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const txt = e.currentTarget.value; // "HH:mm"
      const [hhStr, mmStr] = txt.split(':');
      const hh = Math.max(0, Math.min(23, Number(hhStr ?? 0)));
      const mm = Math.max(0, Math.min(59, Number(mmStr ?? 0)));
      const base = value ?? new Date();
      onChange(
        new Date(base.getFullYear(), base.getMonth(), base.getDate(), hh, mm, 0, 0)
      );
    };

    const clear = () => {
      onChange(null);
      setOpened(false);
    };

    return (
      <Popover
        opened={opened}
        onChange={setOpened}
        width={dropdownWidth}
        position="bottom-start"
        shadow="md"
        withinPortal
        zIndex={4000}
      >
        <Popover.Target>
          <TextInput
            id={id}
            label={label}
            placeholder={placeholder ?? (kind === 'date' ? 'ДД.ММ.ГГГГ' : 'ДД.ММ.ГГГГ ЧЧ:ММ')}
            value={display}
            readOnly
            onClick={() => !disabled && setOpened((o) => !o)}
            withAsterisk={required}
            error={error}
            size="xs"
            radius="xl"
            variant="filled"
            disabled={disabled}
            leftSection={<IconCalendar size={16} />}
            rightSection={
              clearable && value ? (
                <Button
                  size="compact-xs"
                  variant="subtle"
                  color="gray"
                  onClick={(e) => {
                    e.stopPropagation();
                    clear();
                  }}
                >
                  X
                </Button>
              ) : null
            }
            styles={{
              input: { background: 'var(--mantine-color-default)', cursor: 'pointer' },
            }}
          />
        </Popover.Target>

        <Popover.Dropdown p="xs">
          <Box style={{ display: 'grid', gap: 8 }}>
            <DatePicker
              value={value}
              onChange={handleDaySelect}
              minDate={minDate}
              maxDate={maxDate}
              locale="ru"
              firstDayOfWeek={1}
              // Кастомная шапка: стрелки по краям, месяц по центру
              previousIcon={<IconChevronLeft size={16} />}
              nextIcon={<IconChevronRight size={16} />}
              styles={{
                calendarHeader: {
                  display: 'grid',
                  gridTemplateColumns: '28px 1fr 28px',
                  alignItems: 'center',
                  gap: 8,
                  padding: '4px 0',
                },
                calendarHeaderControl: {
                  height: 28,
                  width: 28,
                  minHeight: 28,
                  minWidth: 28,
                  borderRadius: 8,
                  background: 'transparent',
                },
                calendarHeaderLevel: {
                  justifySelf: 'center',
                  textAlign: 'center',
                  fontWeight: 600,
                  margin: 0,
                  padding: '2px 6px',
                  borderRadius: 8,
                },
                weekdaysRow: {
                  justifyContent: 'center',
                  gap: 6,
                },
                weekday: {
                  textAlign: 'center',
                  width: 28,
                },
                monthCell: { padding: 0 },
                day: { height: 28, width: 28, lineHeight: '28px', textAlign: 'center' },
              }}
            />

            {kind === 'datetime' && (
              <Group gap="xs" align="center">
                <TimeInput
                  value={`${String(timeHH).padStart(2, '0')}:${String(timeMM).padStart(2, '0')}`}
                  onChange={handleTimeChange}
                  withSeconds={false}
                  size="xs"
                  styles={{ input: { textAlign: 'center' } }}
                />
              </Group>
            )}

            <Group gap="xs" justify="space-between" mt={2}>
              <Button size="compact-xs" variant="light" onClick={setToday}>
                Сегодня
              </Button>

              {clearable && value && (
                <Button size="compact-xs" variant="subtle" color="gray" onClick={clear}>
                  X
                </Button>
              )}
            </Group>
          </Box>
        </Popover.Dropdown>
      </Popover>
    );
  }
);

AppDateField.displayName = 'AppDateField';
