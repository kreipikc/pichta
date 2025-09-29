import { useEffect } from 'react';
import { ScrollArea, Button, Group, Paper, Stack, Text, TextInput } from '@mantine/core';
import { AppDateField } from '@/components/date-time-picker/AppDateField';
import { FormWrapper } from '@/components/form-wrapper/FormWrapper';
import { useQuestionnaire } from '../context/QuestionnaireContext';

type EduItem = {
  institution: string;   // direction на бэке
  degree: string;        // type на бэке
  start?: string | null; // ISO
  end?: string | null;   // ISO | null
};

export default function EducationForm() {
  const { data, updateData } = useQuestionnaire();

  const list: EduItem[] = Array.isArray((data as any).educationList)
    ? (data as any).educationList
    : (data.education?.institution || data.education?.degree)
      ? [{ institution: data.education?.institution ?? '', degree: data.education?.degree ?? '', start: null, end: null }]
      : [];

  useEffect(() => {
    // нормализуем в массив и обнуляем старое поле совместимости
    updateData({ educationList: list, education: { institution: '', degree: '' } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addRow = () => {
    updateData({ educationList: [...list, { institution: '', degree: '', start: null, end: null }] });
  };

  const removeRow = (idx: number) => {
    const next = list.slice();
    next.splice(idx, 1);
    updateData({ educationList: next });
  };

  const patch = (idx: number, patch: Partial<EduItem>) => {
    const next = list.slice();
    next[idx] = { ...next[idx], ...patch };
    updateData({ educationList: next });
  };

  return (
    <FormWrapper formId="education">
      <Stack gap="md">
        <Group justify="space-between">
          <Text fw={600}>Образование</Text>
          <Button size="xs" onClick={addRow}>Добавить</Button>
        </Group>
      <ScrollArea.Autosize mah={420} type="auto" scrollbarSize={8} offsetScrollbars>
        {list.length === 0 && (
          <Paper withBorder p="md">
            <Text c="dimmed">Пока пусто. Нажмите «Добавить», чтобы создать запись об образовании.</Text>
          </Paper>
        )}

        {list.map((row, i) => (
          <Paper key={i} withBorder p="md" radius="md">
            <Stack gap="sm">
              <Group grow>
                <TextInput
                  label="Учреждение"
                  placeholder="Например: МГУ"
                  value={row.institution}
                  onChange={(e) => patch(i, { institution: e.currentTarget.value })}
                />
                <TextInput
                  label="Степень / Направление"
                  placeholder="Бакалавр информатики"
                  value={row.degree}
                  onChange={(e) => patch(i, { degree: e.currentTarget.value })}
                />
              </Group>
              <Group grow>
                <AppDateField
                  kind="date"
                  label="Дата начала"
                  placeholder="Выберите дату"
                  value={row.start ? new Date(row.start) : null}
                  onChange={(d: Date | null) => patch(i, { start: d ? new Date(d).toISOString() : null })}
                  required
                />
                <AppDateField
                  kind="date"
                  label="Дата окончания"
                  placeholder="Необязательно"
                  value={row.end ? new Date(row.end) : null}
                  onChange={(d: Date | null) => patch(i, { end: d ? new Date(d).toISOString() : null })}
                />
              </Group>
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
