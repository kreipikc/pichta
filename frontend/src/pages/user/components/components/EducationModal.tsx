import { useEffect, useMemo, useRef, useState } from "react";
import { Modal, TextInput, Button, Group } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import dayjs from "dayjs";
import type { EducationCreateI, EducationResponseI } from "@/shared/types/api/EducationI";

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

  // Инициализируем форму только при открытии / смене режима
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
      <TextInput
        label="Тип"
        placeholder="Высшее, Курсы и т.п."
        value={form.type ?? ""}
        onChange={(e) => {
          const v = e.currentTarget.value;
          setForm((f) => ({ ...f, type: v }));
        }}
        required
        mt="xs"
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
        mt="xs"
      />

      <Group grow mt="xs">
        <DateInput
          label="Начало"
          placeholder="Выберите дату"
          value={form.start_time ? new Date(form.start_time) : null}
          onChange={(d) =>
            setForm((f) => ({ ...f, start_time: d ? dayjs(d).toISOString() : null }))
          }
          clearable
        />
        <DateInput
          label="Окончание"
          placeholder="Выберите дату"
          value={form.end_time ? new Date(form.end_time) : null}
          onChange={(d) =>
            setForm((f) => ({ ...f, end_time: d ? dayjs(d).toISOString() : null }))
          }
          clearable
        />
      </Group>

      <Button
        fullWidth
        mt="md"
        color="teal"
        onClick={() => onSave(form)}
        loading={saving}
        disabled={!canSave}
      >
        Сохранить
      </Button>
    </Modal>
  );
}
