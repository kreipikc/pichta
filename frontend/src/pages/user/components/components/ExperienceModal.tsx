import { useEffect, useMemo, useRef, useState } from "react";
import { Modal, TextInput, Button, Group, Textarea, Stack } from "@mantine/core";
import dayjs from "dayjs";
import type { ExperienceCreateI, ExperienceResponseI } from "@/shared/types/api/ExperienceI";
import { AppDateField } from "@/components/date-time-picker/AppDateField";

export type ExperienceModalValue =
  Partial<ExperienceCreateI> &
  Partial<ExperienceResponseI> & { id?: number };

type Props = {
  opened: boolean;
  onClose: () => void;
  value: ExperienceModalValue;
  onSave: (data: ExperienceModalValue) => void;
  saving?: boolean;
};

const EMPTY: ExperienceModalValue = {
  title: "",
  id_profession: null,
  description: "",
  // важный момент: во многих типах start_time = string | undefined (без null)
  start_time: dayjs().toISOString(),
  end_time: undefined,
};

export default function ExperienceModal({ opened, onClose, value, onSave, saving }: Props) {
  const [form, setForm] = useState<ExperienceModalValue>(EMPTY);

  const openedRef = useRef(false);
  const isEdit = Boolean(value?.id);

  useEffect(() => {
    if (opened && !openedRef.current) {
      setForm(isEdit ? value : { ...EMPTY, ...value });
      openedRef.current = true;
    }
    if (!opened && openedRef.current) {
      openedRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened, isEdit, value?.id]);

  const canSave = useMemo(() => {
    const hasTitle = Boolean((form.title ?? "").trim());
    const hasStart = Boolean(form.start_time);
    return hasTitle && hasStart;
  }, [form.title, form.start_time]);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={isEdit ? "Редактировать опыт" : "Добавить опыт"}
      centered
    >
      <Stack gap="xs">
        <TextInput
          label="Должность / заголовок"
          placeholder="Frontend разработчик"
          value={form.title ?? ""}
          onChange={(e) => {
            const v = e.currentTarget.value;
            setForm((f) => ({ ...f, title: v }));
          }}
          required
        />

        <Group grow>
          <AppDateField
            kind="date"
            label="Начало"
            value={form.start_time ? new Date(form.start_time) : null}
            onChange={(d) =>
              setForm((f) => ({ ...f, start_time: d ? d.toISOString() : undefined }))
            }
          />
          <AppDateField
            kind="date"
            label="Окончание"
            value={form.end_time ? new Date(form.end_time) : null}
            onChange={(d) =>
              setForm((f) => ({ ...f, end_time: d ? d.toISOString() : undefined }))
            }
          />
        </Group>

        <Textarea
          label="Описание (опционально)"
          placeholder="Ключевые задачи и достижения…"
          value={form.description ?? ""}
          onChange={(e) => {
            const v = e.currentTarget.value;
            setForm((f) => ({ ...f, description: v }));
          }}
          autosize
          minRows={2}
        />

        <Button
          fullWidth
          mt="sm"
          color="teal"
          onClick={() => onSave(form)}
          loading={saving}
          disabled={!canSave}
        >
          Сохранить
        </Button>
      </Stack>
    </Modal>
  );
}
