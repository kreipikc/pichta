import { useEffect, useMemo } from 'react';
import {
  Button,
  Group,
  Paper,
  Stack,
  Text,
  Textarea,
  Select,
  Autocomplete,
} from '@mantine/core';
import { AppDateField } from '@/components/date-time-picker/AppDateField';
import { FormWrapper } from '@/components/form-wrapper/FormWrapper';
import { useQuestionnaire } from '../context/QuestionnaireContext';
import { useGetAllProfessionQuery } from '@/app/redux/api/profession.api';

const LEVELS = ['Intern', 'Junior', 'Middle', 'Senior', 'Lead'] as const;
type Level = (typeof LEVELS)[number];

type ExpItem = {
  name: string;          // свободный ввод ИЛИ выбор из списка
  level: Level;
  description?: string | null;
  start?: string | null; // ISO
  end?: string | null;   // ISO | null
};

export default function ExperienceForm() {
  const { data, updateData } = useQuestionnaire();

  // подсказки из справочника профессий
  const { data: profs } = useGetAllProfessionQuery();
  const profNames: string[] = useMemo(
    () => (profs ?? []).map((p: any) => p.name).filter(Boolean),
    [profs]
  );

  const list: ExpItem[] = Array.isArray((data as any).experienceList)
    ? (data as any).experienceList
    : Array.isArray(data.experience) && data.experience.length
      ? data.experience.map((e: any) => ({ ...e, start: null, end: null }))
      : [];

  useEffect(() => {
    // нормализация в массив (если уже есть — ничего не меняется)
    updateData({ experienceList: list });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addRow = () => {
    updateData({
      experienceList: [
        ...list,
        { name: '', level: 'Junior', description: '', start: null, end: null },
      ],
    });
  };

  const removeRow = (idx: number) => {
    const next = list.slice();
    next.splice(idx, 1);
    updateData({ experienceList: next });
  };

  const patch = (idx: number, patch: Partial<ExpItem>) => {
    const next = list.slice();
    next[idx] = { ...next[idx], ...patch };
    updateData({ experienceList: next });
  };

  return (
    <FormWrapper formId="experience">
      <Stack gap="md">
        <Group justify="space-between">
          <Text fw={600}>Опыт работы</Text>
          <Button size="xs" onClick={addRow}>Добавить</Button>
        </Group>

        {list.length === 0 && (
          <Paper withBorder p="md">
            <Text c="dimmed">Пока пусто. Нажмите «Добавить», чтобы создать запись об опыте.</Text>
          </Paper>
        )}

        {list.map((row, i) => (
          <Paper key={i} withBorder p="md" radius="md">
            <Stack gap="sm">
              <Group grow>
                <Autocomplete
                  label="Должность / Профессия"
                  placeholder="Начните вводить и выберите из списка или введите своё"
                  value={row.name}
                  data={profNames}
                  onChange={(val) => patch(i, { name: val })}
                  limit={100}
                  withAsterisk
                  comboboxProps={{ shadow: 'md' }}
                />
                <Select
                  label="Уровень"
                  data={LEVELS.map((l) => ({ value: l, label: l }))}
                  value={row.level}
                  onChange={(v) => patch(i, { level: (v as Level) ?? 'Junior' })}
                />
              </Group>

              <Textarea
                label="Описание (необязательно)"
                autosize
                minRows={2}
                value={row.description ?? ''}
                onChange={(e) => patch(i, { description: e.currentTarget.value })}
              />

              <Group grow>
                <AppDateField
                  kind="date"
                  label="Дата начала"
                  placeholder="Выберите дату"
                  value={row.start ? new Date(row.start) : null}
                  onChange={(d: Date | null) =>
                    patch(i, { start: d ? new Date(d).toISOString() : null })
                  }
                  required
                />
                <AppDateField
                  kind="date"
                  label="Дата окончания"
                  placeholder="Если ещё работаете — оставьте пустым"
                  value={row.end ? new Date(row.end) : null}
                  onChange={(d: Date | null) =>
                    patch(i, { end: d ? new Date(d).toISOString() : null })
                  }
                />
              </Group>

              <Group justify="flex-end">
                <Button variant="light" color="red" onClick={() => removeRow(i)}>
                  Удалить
                </Button>
              </Group>
            </Stack>
          </Paper>
        ))}
      </Stack>
    </FormWrapper>
  );
}
