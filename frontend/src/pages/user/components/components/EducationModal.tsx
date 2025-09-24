import { useEffect, useMemo, useRef, useState } from "react";
import { Modal, TextInput, Button, Group, Stack } from "@mantine/core";
import type { EducationCreateI, EducationResponseI } from "@/shared/types/api/EducationI";
import { AppDateField } from "@/components/date-time-picker/AppDateField";

export type EducationModalValue =
  Partial<EducationCreateI> &
  Partial<EducationResponseI> & { id?: number };

type Props = {
  opened: boolean;
  onClose: () => void;
  value: EducationModalValue;
  onSave: (data: EducationModalValue) => void;
  saving?: boolean;
};

const EMPTY: EducationModalValue = {
  type: "",
  direction: "",
  start_time: null,
  end_time: null,
};

export default function EducationModal({ opened, onClose, value, onSave, saving }: Props) {
  const [form, setForm] = useState<EducationModalValue>(EMPTY);

  // Инициализация формы при открытии
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

  const canSave = useMemo(
    () => Boolean((form.type ?? "").trim() && (form.direction ?? "").trim()),
    [form.type, form.direction]
  );

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={isEdit ? "Редактировать образование" : "Добавить образование"}
      centered
    >
      <Stack gap="xs">
        <TextInput
          label="Тип"
          placeholder="Высшее, Курсы и т.п."
          value={form.type ?? ""}
          onChange={(e) => {
            const v = e.currentTarget.value;
            setForm((f) => ({ ...f, type: v }));
          }}
          required
        />

        <TextInput
          label="Направление / специальность"
          placeholder="Прикладная математика"
          value={form.direction ?? ""}
          onChange={(e) => {
            const v = e.currentTarget.value;
            setForm((f) => ({ ...f, direction: v }));
          }}
          required
        />

        <Group grow>
          <AppDateField
            kind="date"
            label="Начало"
            value={form.start_time ? new Date(form.start_time) : null}
            onChange={(d) =>
              setForm((f) => ({ ...f, start_time: d ? d.toISOString() : null }))
            }
          />
          <AppDateField
            kind="date"
            label="Окончание"
            value={form.end_time ? new Date(form.end_time) : null}
            onChange={(d) =>
              setForm((f) => ({ ...f, end_time: d ? d.toISOString() : null }))
            }
          />
        </Group>

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
