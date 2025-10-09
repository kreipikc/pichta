import { useMemo, useState } from "react";
import {
  Button,
  Card,
  Center,
  Group,
  ActionIcon,
  Tooltip,
  TextInput,
  Textarea,
} from "@mantine/core";
import { IconPlus, IconPencil, IconTrash, IconCheck, IconX } from "@tabler/icons-react";
import { DataTable } from "mantine-datatable";
import dayjs from "dayjs";

import { useTasks } from "@/hooks/useTasks";
import type { TaskResponseI, TaskCreateSelfI } from "@/shared/types/api/TaskI";
import type { TaskUpdateI } from "@/shared/types/api/TaskI";

import StatusSelect, { StatusOption } from "./components/task/StatusSelect";
import AddTaskModal from "./components/task/AddTaskModal";
import { AppDateField } from "@/components/date-time-picker/AppDateField";
import classes from "./components/task/tasks.module.css";

type RowDraft = {
  title: string;
  description: string | null;
  status: StatusOption;
  start_time: Date | null;
  end_time: Date | null;
};

export default function TasksSection({ userId }: { userId: number }) {
  const { tasks, isLoading, addForMe, patch, remove, states } = useTasks(userId);

  // --- Модалка добавления ---
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState<RowDraft>({
    title: "",
    description: "",
    status: "pending",
    start_time: null,
    end_time: null,
  });

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
    // название + обязательная дата начала
    return form.title.trim().length > 0 && !!form.start_time;
  }

  // --- Редактирование строк в таблице ---
  const [editing, setEditing] = useState<Record<number, boolean>>({});
  const [drafts, setDrafts] = useState<Record<number, RowDraft>>({});

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
        <h3 className={classes.pageTitle}>Задачи</h3>
        <Button leftSection={<IconPlus size={16} />} onClick={() => setAddOpen(true)}>
          Добавить
        </Button>
      </Group>

      <Card withBorder radius="md" p="md">
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
            classNames={{
              root: classes.tableRoot,
            }}
            columns={[
              {
                accessor: "title",
                title: "Название",
                render: (t) => {
                  const isEdit = !!editing[t.id];
                  const d = drafts[t.id];
                  return isEdit ? (
                    <TextInput
                      className={classes.inputUnstyledMantine}
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
                      className={classes.inputUnstyledMantine}
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
                      className={classes.textareaUnstyledMantine}
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
                      className={classes.textareaUnstyledMantine}
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
                width: 170,
                render: (t) => {
                  const isEdit = !!editing[t.id];

                  if (isEdit) {
                    const saving = states.updating;
                    return (
                      <div className={classes.actionsCell}>
                        <Group gap="xs" justify="center" wrap="nowrap">
                          <Tooltip label="Сохранить">
                            <ActionIcon
                              className={classes.actionIcon}
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
                              className={classes.actionIcon}
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
                              className={classes.actionIcon}
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
                    <div className={classes.actionsCell}>
                      <Group gap="xs" justify="center" wrap="nowrap">
                        <Tooltip label="Редактировать">
                          <ActionIcon
                            className={classes.actionIcon}
                            variant="subtle"
                            aria-label="Редактировать"
                            onClick={() => startEdit(t)}
                          >
                            <IconPencil size={18} />
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip label="Удалить">
                          <ActionIcon
                            className={classes.actionIcon}
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

      <AddTaskModal
        opened={addOpen}
        onClose={() => setAddOpen(false)}
        value={form}
        onChange={setForm}
        onSubmit={handleAdd}
        canSubmit={canSaveNew()}
      />
    </>
  );
}
