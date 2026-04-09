import { useMemo } from 'react';
import { ScrollArea, Button, Group, Paper, Stack, Text, Textarea, Select, TextInput } from '@mantine/core';
import { AppDateField } from '@/components/date-time-picker/AppDateField';
import { FormWrapper } from '@/components/form-wrapper/FormWrapper';
import { useQuestionnaire } from '../context/QuestionnaireContext';
import { useGetAllProfessionQuery } from '@/app/redux/api/profession.api';

type ExpItem = {
  org: string;
  professionId: number | null;
  description?: string | null;
  start?: string | null;
  end?: string | null;
};

export default function ExperienceForm() {
  const { data, updateData } = useQuestionnaire();
  const { data: profs = [] } = useGetAllProfessionQuery();
  const profOptions = (profs ?? []).map((p: any) => ({ value: String(p.id), label: p.name }));

  const list: ExpItem[] = ((data as any).experienceList ?? (data as any).experience ?? []) as any;

  const sync = (next: ExpItem[]) =>
    updateData({ experienceList: next, experience: next }); // поддерживаем оба ключа

  const addRow = () => sync([...(list || []), { org: '', professionId: null, start: null, end: null }]);
  const removeRow = (idx: number) => sync(list.filter((_, i) => i !== idx));
  const patch = (idx: number, p: Partial<ExpItem>) => {
    const next = list.slice();
    next[idx] = { ...next[idx], ...p };
    sync(next);
  };

  return (
    <FormWrapper formId="experience">
      <Stack>
        <Group justify="space-between">
          <Text fw={600}>Опыт работы</Text>
          <Button size="xs" onClick={addRow}>Добавить</Button>
        </Group>
        <ScrollArea.Autosize mah={420}>
          {(list.length === 0) && (
            <Paper p="lg" radius="md" withBorder>
              <Text size="sm" c="dimmed">Нет записей. Добавьте первую запись.</Text>
            </Paper>
          )}
          {list.map((row, i) => (
            <Paper key={i} p="lg" radius="md" withBorder>
              <Stack gap="sm">
                <Group grow>
                  <TextInput
                    label="Организация"
                    placeholder="Название организации"
                    value={row.org ?? ''}
                    onChange={(e) => patch(i, { org: e.currentTarget.value })}
                    required
                  />
                  <Select
                    label="Должность"
                    placeholder="Выберите должность"
                    searchable
                    data={profOptions}
                    nothingFoundMessage="Нет совпадений"
                    value={row.professionId ? String(row.professionId) : null}
                    onChange={(v) => patch(i, { professionId: v ? Number(v) : null })}
                    required
                  />
                </Group>
                <Group grow>
                  <AppDateField kind="date" label="Начало" value={row.start ? new Date(row.start) : null}
                    onChange={(d) => patch(i, { start: d ? d.toISOString() : null })} required />
                  <AppDateField kind="date" label="Окончание" value={row.end ? new Date(row.end) : null}
                    onChange={(d) => patch(i, { end: d ? d.toISOString() : null })} />
                </Group>
                <Textarea
                  label="Описание (опционально)"
                  autosize minRows={2} maxRows={4}
                  value={row.description ?? ''}
                  onChange={(e) => patch(i, { description: e.currentTarget.value })}
                />
                <Group justify="flex-end">
                  <Button variant="light" color="red" onClick={() => removeRow(i)}>Удалить</Button>
                </Group>
              </Stack>
            </Paper>
          ))}
        </ScrollArea.Autosize>
      </Stack>
    </FormWrapper>
  );
}
