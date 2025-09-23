import { useState } from "react";
import {
  Card,
  Badge,
  Group,
  Button,
  ActionIcon,
  Flex,
  Modal,
  TextInput,
  Select,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { IconCheck, IconClock, IconAlertCircle, IconTrash, IconPlus } from "@tabler/icons-react";
import { DataTable } from "mantine-datatable";
import dayjs from "dayjs";

type Task = {
  id: string;
  title: string;
  status: "выполнено" | "в процессе" | "ожидает";
  deadline: string;
};

const initialTasks: Task[] = [
  {
    id: "1",
    title: "Завершить отчёт по проекту",
    status: "в процессе",
    deadline: "2025-04-01",
  },
  {
    id: "2",
    title: "Созвон с командой",
    status: "ожидает",
    deadline: "2025-04-03",
  },
  {
    id: "3",
    title: "Отправить письмо заказчику",
    status: "выполнено",
    deadline: "2025-03-25",
  },
];

const statusOptions: Task["status"][] = ["выполнено", "в процессе", "ожидает"];

const getStatusBadge = (status: Task["status"]) => {
  const icon =
    status === "выполнено" ? (
      <IconCheck size={14} />
    ) : status === "в процессе" ? (
      <IconClock size={14} />
    ) : (
      <IconAlertCircle size={14} />
    );

  const color =
    status === "выполнено"
      ? "green"
      : status === "в процессе"
      ? "yellow"
      : "gray";

  return (
    <Badge color={color} leftSection={icon}>
      {status}
    </Badge>
  );
};

export default function TasksSection() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [modalOpened, setModalOpened] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDeadline, setNewDeadline] = useState<Date | null>(new Date());

  const handleDelete = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const handleAdd = () => {
    if (!newTitle || !newDeadline) return;
    const newTask: Task = {
      id: Date.now().toString(),
      title: newTitle,
      status: "ожидает",
      deadline: dayjs(newDeadline).format("YYYY-MM-DD"),
    };
    setTasks((prev) => [newTask, ...prev]);
    setModalOpened(false);
    setNewTitle("");
    setNewDeadline(new Date());
  };

  const handleStatusChange = (id: string, newStatus: Task["status"]) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, status: newStatus } : task
      )
    );
  };

  return (
    <>
      <Modal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        title="Новая задача"
        centered
      >
        <TextInput
          label="Название задачи"
          placeholder="Введите название"
          value={newTitle}
          onChange={(e) => setNewTitle(e.currentTarget.value)}
          required
          mb="md"
        />
        <DateInput
          label="Дедлайн"
          value={newDeadline}
          onChange={setNewDeadline}
          required
        />
        <Button fullWidth mt="md" color="teal" onClick={handleAdd}>
          Добавить
        </Button>
      </Modal>

      <Card withBorder className="tasks-card">
        <Flex justify="space-between" align="center" mb="sm">
          <h2 className="section-title">Мои задачи</h2>
          <Button color="teal" leftSection={<IconPlus size={16} />} onClick={() => setModalOpened(true)}>
            Добавить
          </Button>
        </Flex>

        <DataTable
          withTableBorder
          striped
          highlightOnHover
          records={tasks}
          columns={[
            { accessor: "title", title: "Название задачи" },
            {
              accessor: "status",
              title: "Статус",
              render: (task) => (
                <Group>
                  {getStatusBadge(task.status)}
                  <Select
                    data={statusOptions}
                    value={task.status}
                    onChange={(val) =>
                      val && handleStatusChange(task.id, val as Task["status"])
                    }
                    size="xs"
                    variant="unstyled"
                    className="task-status-select"
                  />
                </Group>
              ),
            },
            { accessor: "deadline", title: "Дедлайн" },
            {
              accessor: "actions",
              title: "",
              textAlign: "right",
              render: (task) => (
                <ActionIcon color="red" variant="subtle" onClick={() => handleDelete(task.id)}>
                  <IconTrash size={18} />
                </ActionIcon>
              ),
            },
          ]}
        />
      </Card>
    </>
  );
}
