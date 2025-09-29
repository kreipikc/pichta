import { useState, useMemo, ReactNode } from "react";
import {
  Card,
  Group,
  Button,
  ActionIcon,
  Modal,
  TextInput,
  Textarea,
  Select,
  Stack,
  CloseButton,
  rem,
  Box,
  Center,
  Tooltip,
} from "@mantine/core";
// ⬇⬇⬇ заменили Mantine DateTimePicker на наш кастом:
import { AppDateField } from "@/components/date-time-picker/AppDateField";
import {
  IconPlus,
  IconTrash,
  IconCheck,
  IconClock,
  IconAlertCircle,
  IconCircleFilled,
  IconPencil,
  IconX,
} from "@tabler/icons-react";
import { DataTable } from "mantine-datatable";
import dayjs from "dayjs";

import { useTasks } from "@/hooks/useTasks";
import type { TaskResponseI, TaskCreateSelfI } from "@/shared/types/api/TaskI";
import type { TaskUpdatePatch } from "@/app/redux/api/task.api";
import type { TaskUpdateI } from "@/shared/types/api/TaskI";

type StatusOption = "pending" | "in_progress" | "done";

const STATUS_LABELS: Record<StatusOption, string> = {
  pending: "ожидает",
  in_progress: "в процессе",
  done: "выполнено",
};
const STATUS_ICON: Record<StatusOption, ReactNode> = {
  pending: <IconAlertCircle size={14} />,
  in_progress: <IconClock size={14} />,
  done: <IconCheck size={14} />,
};
const STATUS_COLOR: Record<StatusOption, { bgVar: string; fgVar: string }> = {
  pending: {
    bgVar: "var(--mantine-color-yellow-light)",
    fgVar: "var(--mantine-color-yellow-light-color)",
  },
  in_progress: {
    bgVar: "var(--mantine-color-blue-light)",
    fgVar: "var(--mantine-color-blue-light-color)",
  },
  done: {
    bgVar: "var(--mantine-color-green-light)",
    fgVar: "var(--mantine-color-green-light-color)",
  },
};
const STATUS_SELECT_DATA = (Object.keys(STATUS_LABELS) as StatusOption[]).map((v) => ({
  value: v,
  label: STATUS_LABELS[v],
}));

function StatusSelect({
  value,
  onChange,
  maw = 160,
}: {
  value: StatusOption;
  onChange: (val: StatusOption) => void;
  maw?: number;
}) {
  const colors = STATUS_COLOR[value];
  return (
    <Select
      data={STATUS_SELECT_DATA}
      value={value}
      onChange={(val) => val && onChange(val as StatusOption)}
      allowDeselect={false}
      size="xs"
      radius="xl"
      variant="filled"
      comboboxProps={{
        withinPortal: true,
        zIndex: 4000,
        position: "bottom-start",
      }}
      styles={{
        input: {
          background: colors.bgVar,
          color: colors.fgVar,
          paddingLeft: rem(28),
          paddingRight: rem(28),
          borderColor: "transparent",
        },
      }}
      leftSection={
        <Box style={{ display: "flex", alignItems: "center", color: colors.fgVar }}>
          {STATUS_ICON[value]}
        </Box>
      }
      renderOption={({ option }) => {
        const val = option.value as StatusOption;
        const c = STATUS_COLOR[val];
        return (
          <Group gap="xs">
            <IconCircleFilled size={10} style={{ color: c.fgVar }} />
            <span>{STATUS_LABELS[val]}</span>
          </Group>
        );
      }}
      withCheckIcon={false}
      maw={maw}
      rightSectionPointerEvents="none"
      clearable={false}
      searchable={false}
    />
  );
}

type RowDraft = {
  title: string;
  description: string | null;
  status: StatusOption;
  start_time: Date | null;
  end_time: Date | null;
};

export default function TasksSection({ userId }: { userId: number }) {
  const { tasks, isLoading, addForMe, patch, remove, states } = useTasks(userId);

  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState<RowDraft>({
    title: "",
    description: "",
    status: "pending",
    start_time: null,
    end_time: null,
  });

  const [editing, setEditing] = useState<Record<number, boolean>>({});
  const [drafts, setDrafts] = useState<Record<number, RowDraft>>({});

  async function handleAdd() {
    if (!userId) return;
    const body: TaskCreateSelfI = {
      title: form.title.trim(),
      description: form.description?.trim() ? form.description.trim() : null,
      status: form.status,
      start_time: form.start_time ? form.start_time.toISOString() : null,
      end_time: form.end_time ? form.end_time.toISOString() : null,
      created_from: userId,
    };
    await addForMe(body);
    setAddOpen(false);
    setForm({
      title: "",
      description: "",
      status: "pending",
      start_time: null,
      end_time: null,
    });
  }
  function canSaveNew() {
    return form.title.trim().length > 0;
  }

  function startEdit(t: TaskResponseI) {
    setEditing((e) => ({ ...e, [t.id]: true }));
    setDrafts((d) => ({
      ...d,
      [t.id]: {
        title: t.title ?? "",
        description: (t.description as string | null) ?? null,
        status: ((t.status as StatusOption) || "pending") as StatusOption,
        start_time: t.start_time ? new Date(t.start_time) : null,
        end_time: t.end_time ? new Date(t.end_time) : null,
      },
    }));
  }
  function cancelEdit(id: number) {
    setEditing((e) => {
      const copy = { ...e };
      delete copy[id];
      return copy;
    });
    setDrafts((d) => {
      const copy = { ...d };
      delete copy[id];
      return copy;
    });
  }
  async function saveEdit(id: number) {
    const d = drafts[id];
    if (!d) return;
    const body: TaskUpdateI = {
      title: d.title?.trim(),
      description: d.description?.trim() || null,
      status: d.status,
      start_time: d.start_time ? d.start_time.toISOString() : null,
      end_time: d.end_time ? d.end_time.toISOString() : null,
    };
    await patch(id, body);
    cancelEdit(id);
  }

  const hasRecords = useMemo(() => (tasks?.length ?? 0) > 0, [tasks]);

  return (
    <>
      <Group justify="space-between" align="center" mb="md">
        <h3 style={{ margin: 0 }}>Задачи</h3>
        <Button leftSection={<IconPlus size={16} />} onClick={() => setAddOpen(true)}>
          Добавить
        </Button>
      </Group>

      <Card withBorder radius="md" p="md">
        {hasRecords && (
          <style>
            {`
              .mantine-datatable-empty-state { display: none !important; }
              .mantine-datatable-loader { display: none !important; }

              /* ед. стилизация для инпутов без рамок */
              .task-input-unstyled .mantine-Input-input,
              .task-textarea-unstyled .mantine-Input-input {
                border: none !important;
                background: transparent !important;
                box-shadow: none !important;
              }

              /* фиксированная геометрия кнопок действий, чтобы высота строки не прыгала */
              .task-actions-cell { height: 34px; display: flex; align-items: center; justify-content: center; }
              .task-action { width: 32px; height: 32px; }
            `}
          </style>
        )}

        {!isLoading && !hasRecords ? (
          <Center mih={120} c="dimmed">
            Задач пока нет
          </Center>
        ) : (
          <DataTable<TaskResponseI>
            withTableBorder
            withColumnBorders
            striped
            highlightOnHover
            records={tasks ?? []}
            idAccessor="id"
            noRecordsText=""
            fetching={isLoading}
            columns={[
              {
                accessor: "title",
                title: "Название",
                render: (t) => {
                  const isEdit = !!editing[t.id];
                  const d = drafts[t.id];
                  return isEdit ? (
                    <TextInput
                      className="task-input-unstyled"
                      variant="unstyled"
                      value={d?.title ?? ""}
                      onChange={(e) =>
                        setDrafts((prev) => ({
                          ...prev,
                          [t.id]: { ...(prev[t.id] as RowDraft), title: e.currentTarget.value },
                        }))
                      }
                    />
                  ) : (
                    <TextInput
                      variant="unstyled"
                      value={t.title ?? ""}
                      readOnly
                      className="task-input-unstyled"
                    />
                  );
                },
              },
              {
                accessor: "description",
                title: "Описание",
                width: 320,
                render: (t) => {
                  const isEdit = !!editing[t.id];
                  const d = drafts[t.id];
                  return isEdit ? (
                    <Textarea
                      className="task-textarea-unstyled"
                      variant="unstyled"
                      autosize
                      minRows={2}
                      value={d?.description ?? ""}
                      onChange={(e) =>
                        setDrafts((prev) => ({
                          ...prev,
                          [t.id]: {
                            ...(prev[t.id] as RowDraft),
                            description: e.currentTarget.value,
                          },
                        }))
                      }
                    />
                  ) : (
                    <Textarea
                      className="task-textarea-unstyled"
                      variant="unstyled"
                      autosize
                      minRows={1}
                      value={t.description ?? ""}
                      readOnly
                    />
                  );
                },
              },
              {
                accessor: "status",
                title: "Статус",
                width: 180,
                render: (t) => {
                  const isEdit = !!editing[t.id];
                  const d = drafts[t.id];
                  const current = (isEdit ? d?.status : (t.status as StatusOption)) || "pending";
                  return (
                    <StatusSelect
                      value={current}
                      onChange={(val) => {
                        if (isEdit) {
                          setDrafts((prev) => ({
                            ...prev,
                            [t.id]: { ...(prev[t.id] as RowDraft), status: val },
                          }));
                        } else {
                          patch(t.id, { status: val });
                        }
                      }}
                      maw={160}
                    />
                  );
                },
              },
              {
                accessor: "start_time",
                title: "Начало",
                width: 200,
                render: (t) => {
                  const isEdit = !!editing[t.id];
                  const d = drafts[t.id];
                  return isEdit ? (
                    <AppDateField
                      kind="datetime"
                      clearable
                      value={d?.start_time ?? null}
                      onChange={(val) =>
                        setDrafts((prev) => ({
                          ...prev,
                          [t.id]: { ...(prev[t.id] as RowDraft), start_time: val },
                        }))
                      }
                      dropdownWidth={280}
                    />
                  ) : t.start_time ? (
                    dayjs(t.start_time).format("DD.MM.YYYY HH:mm")
                  ) : (
                    "—"
                  );
                },
              },
              {
                accessor: "end_time",
                title: "Завершено",
                width: 200,
                render: (t) => {
                  const isEdit = !!editing[t.id];
                  const d = drafts[t.id];
                  return isEdit ? (
                    <AppDateField
                      kind="datetime"
                      clearable
                      value={d?.end_time ?? null}
                      onChange={(val) =>
                        setDrafts((prev) => ({
                          ...prev,
                          [t.id]: { ...(prev[t.id] as RowDraft), end_time: val },
                        }))
                      }
                      dropdownWidth={280}
                    />
                  ) : t.end_time ? (
                    dayjs(t.end_time).format("DD.MM.YYYY HH:mm")
                  ) : (
                    "—"
                  );
                },
              },
              {
                accessor: "actions",
                title: "",
                width: 170, // шире, чтобы 3 кнопки влезали
                render: (t) => {
                  const isEdit = !!editing[t.id];

                  if (isEdit) {
                    const saving = states.updating;
                    return (
                      <div className="task-actions-cell">
                        <Group gap="xs" justify="center" wrap="nowrap">
                          <Tooltip label="Сохранить">
                            <ActionIcon
                              className="task-action"
                              color="green"
                              variant="subtle"
                              aria-label="Сохранить"
                              onClick={() => saveEdit(t.id)}
                              loading={saving}
                              loaderProps={{ size: 16 }}
                            >
                              <IconCheck size={18} />
                            </ActionIcon>
                          </Tooltip>
                          <Tooltip label="Отменить">
                            <ActionIcon
                              className="task-action"
                              variant="subtle"
                              aria-label="Отменить"
                              onClick={() => cancelEdit(t.id)}
                              disabled={saving}
                            >
                              <IconX size={18} />
                            </ActionIcon>
                          </Tooltip>
                          <Tooltip label="Удалить">
                            <ActionIcon
                              className="task-action"
                              color="red"
                              variant="subtle"
                              aria-label="Удалить"
                              onClick={() => remove(t.id)}
                              disabled={saving}
                            >
                              <IconTrash size={18} />
                            </ActionIcon>
                          </Tooltip>
                        </Group>
                      </div>
                    );
                  }

                  return (
                    <div className="task-actions-cell">
                      <Group gap="xs" justify="center" wrap="nowrap">
                        <Tooltip label="Редактировать">
                          <ActionIcon
                            className="task-action"
                            variant="subtle"
                            aria-label="Редактировать"
                            onClick={() => startEdit(t)}
                          >
                            <IconPencil size={18} />
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip label="Удалить">
                          <ActionIcon
                            className="task-action"
                            color="red"
                            variant="subtle"
                            aria-label="Удалить"
                            onClick={() => remove(t.id)}
                          >
                            <IconTrash size={18} />
                          </ActionIcon>
                        </Tooltip>
                      </Group>
                    </div>
                  );
                },
              },
            ]}
          />
        )}
      </Card>

      <Modal
        opened={addOpen}
        onClose={() => setAddOpen(false)}
        title="Новая задача"
        centered
        size="lg"
      >
        <Stack>
          <TextInput
            label="Название"
            placeholder="Коротко о задаче"
            value={form.title}
            onChange={(e) => setForm((s) => ({ ...s, title: e.currentTarget.value }))}
            required
            rightSectionPointerEvents="none"
            rightSection={
              form.title ? (
                <CloseButton
                  onClick={() => setForm((s) => ({ ...s, title: "" }))}
                  aria-label="Очистить поле"
                />
              ) : null
            }
          />
          <Textarea
            label="Описание"
            placeholder="Детали"
            value={form.description ?? ""}
            onChange={(e) => setForm((s) => ({ ...s, description: e.currentTarget.value }))}
            autosize
            minRows={2}
          />
          <Group grow>
            <div>
              <div style={{ fontSize: rem(12), color: "var(--mantine-color-dimmed)" }}>Статус</div>
              <StatusSelect
                value={form.status}
                onChange={(val) => setForm((s) => ({ ...s, status: val }))}
              />
            </div>
            {/* ⬇⬇⬇ наши объединённые дата/время поля */}
            <AppDateField
              kind="datetime"
              label="Начало"
              clearable
              value={form.start_time}
              onChange={(val) => setForm((s) => ({ ...s, start_time: val }))}
              dropdownWidth={320}
            />
            <AppDateField
              kind="datetime"
              label="Завершение"
              clearable
              value={form.end_time}
              onChange={(val) => setForm((s) => ({ ...s, end_time: val }))}
              dropdownWidth={320}
            />
          </Group>

          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={() => setAddOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleAdd} disabled={!canSaveNew()}>
              Создать
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
