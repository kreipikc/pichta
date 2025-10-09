import { Dispatch, SetStateAction } from "react";
import { Button, CloseButton, Group, Modal, Stack, Textarea, TextInput, rem } from "@mantine/core";
import { AppDateField } from "@/components/date-time-picker/AppDateField";
import StatusSelect, { StatusOption } from "./StatusSelect";

type RowDraft = {
  title: string;
  description: string | null;
  status: StatusOption;
  start_time: Date | null;
  end_time: Date | null;
};

type Props = {
  opened: boolean;
  onClose: () => void;
  value: RowDraft;
  onChange: Dispatch<SetStateAction<RowDraft>>;
  onSubmit: () => Promise<void> | void;
  canSubmit: boolean;
};

export default function AddTaskModal({ opened, onClose, value, onChange, onSubmit, canSubmit }: Props) {
  return (
    <Modal opened={opened} onClose={onClose} title="Новая задача" centered size="lg">
      <Stack>
        <TextInput
          label="Название"
          placeholder="Коротко о задаче"
          value={value.title}
          onChange={(e) => onChange((s) => ({ ...s, title: e.currentTarget.value }))}
          required
          rightSectionPointerEvents="none"
          rightSection={
            value.title ? (
              <CloseButton onClick={() => onChange((s) => ({ ...s, title: "" }))} aria-label="Очистить поле" />
            ) : null
          }
        />

        <Textarea
          label="Описание"
          placeholder="Детали"
          value={value.description ?? ""}
          onChange={(e) => onChange((s) => ({ ...s, description: e.currentTarget.value }))}
          autosize
          minRows={2}
        />

        <Group grow>
          <div>
            <div style={{ fontSize: rem(12), color: "var(--mantine-color-dimmed)" }}>Статус</div>
            <StatusSelect value={value.status} onChange={(val) => onChange((s) => ({ ...s, status: val }))} />
          </div>

          {/* Обязательная дата начала */}
          <AppDateField
            kind="datetime"
            label="Начало"
            value={value.start_time}
            onChange={(val) => onChange((s) => ({ ...s, start_time: val }))}
            dropdownWidth={320}
            required
          />

          <AppDateField
            kind="datetime"
            label="Завершение"
            value={value.end_time}
            onChange={(val) => onChange((s) => ({ ...s, end_time: val }))}
            dropdownWidth={320}
            clearable
          />
        </Group>

        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={onClose}>
            Отмена
          </Button>
          <Button onClick={onSubmit} disabled={!canSubmit}>
            Создать
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
