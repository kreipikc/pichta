import { useEffect, useMemo, useState } from "react";
import {
  Card,
  Progress,
  Modal,
  Group,
  Text,
  Button,
  Slider,
  Loader,
  Stack,
} from "@mantine/core";
import AddSkillModal from "./components/AddSkillModal";
import {
  useGetUserSkillsQuery,
  useGetUserSkillByIdQuery,
  useUpdateSkillMutation,
  useDeleteSkillMutation,
} from "@/app/redux/api/skill.api";
import type {
  UserSkillResponseI,
  UserSkillUpdateI,
} from "@/shared/types/api/SkillI";

type SkillItem = {
  id_skill: number;
  proficiency: number;
  priority?: number | null;
  start_date?: string | null;
  end_date?: string | null;
  status: string;
  name: string;
};

type EditState = {
  proficiency: number;
  priority?: number | null;
  start_date?: string | null;
  end_date?: string | null;
  status: string;
} | null;

export default function SkillsSection({ userId }: { userId: number }) {
  // список навыков конкретного пользователя
  const { data, isLoading, isFetching } = useGetUserSkillsQuery(userId);
  const items: SkillItem[] = useMemo(() => data ?? [], [data]);

  // состояние выбора и модалки
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // загрузка одного навыка по skill_id + user_id (требование бэка)
  const {
    data: selectedData,
    isLoading: isSkillLoading,
  } = useGetUserSkillByIdQuery(
    { skillId: selectedId ?? 0, userId },
    { skip: selectedId == null }
  );

  // локальное состояние формы редактирования (чтобы не мутировать кэш RTK)
  const [edit, setEdit] = useState<EditState>(null);
  useEffect(() => {
    if (!selectedData) {
      setEdit(null);
      return;
    }
    setEdit({
      proficiency: selectedData.proficiency,
      priority: selectedData.priority ?? null,
      start_date: selectedData.start_date ?? null,
      end_date: selectedData.end_date ?? null,
      status: selectedData.status ?? "active",
    });
  }, [selectedData]);

  const [updateSkill, updateState] = useUpdateSkillMutation();
  const [deleteSkill, deleteState] = useDeleteSkillMutation();

  const selectedSkillMeta =
    items.find((i) => i.id_skill === selectedId) ?? null;

  const handleSave = async () => {
    if (selectedId == null || !edit) return;
    const dto: UserSkillUpdateI = {
      proficiency: edit.proficiency,
      priority: edit.priority ?? null,
      start_date: edit.start_date ?? null,
      end_date: edit.end_date ?? null,
      status: edit.status || "active",
    };
    // ВАЖНО: PUT /skill/update/{skill_id}
    await updateSkill({ user_id: userId, skill_id: selectedId, body: dto }).unwrap();
    setSelectedId(null);
  };

  const handleDelete = async (skillId: number) => {
    await deleteSkill({ user_id: userId, skill_id: skillId }).unwrap();
    setSelectedId(null);
  };

  if (isLoading) {
    return (
      <Card withBorder>
        <Loader />
      </Card>
    );
  }

  return (
    <Card withBorder>
      <Group justify="space-between" mb="md">
        <Text fw={700} size="lg">
          Навыки
        </Text>
        <AddSkillModal userId={userId} />
      </Group>

      {items.length === 0 ? (
        <Text c="dimmed">Список пуст</Text>
      ) : (
        <div className="skills-grid">
          {items.map((s) => (
            <Button
              key={s.id_skill}
              variant="subtle"
              fullWidth
              p="md"
              h="100px"
              onClick={() => setSelectedId(s.id_skill)}
              // растягиваем внутренности кнопки, чтобы Progress был на полную ширину
              styles={{
                inner: {
                  width: "100%",
                  flex: "1 1 100%",
                  justifyContent: "flex-start",
                },
                label: { width: "100%", display: "block" },
              }}
            >
              <div style={{ width: "100%" }}>
                <Group justify="space-between" align="center">
                  <Text fw={600} className="skill-name">
                    {s.name}
                  </Text>
                  <Text c="dimmed" className="skill-level">
                    {s.proficiency}%
                  </Text>
                </Group>
                <Progress
                  value={s.proficiency}
                  size="sm"
                  radius="xl"
                  mt={4}
                  style={{ width: "100%", display: "block" }}
                />
              </div>
            </Button>
          ))}
        </div>
      )}

      <Modal
        opened={selectedId != null}
        onClose={() => setSelectedId(null)}
        title={selectedSkillMeta?.name ?? `Навык #${selectedId ?? ""}`}
        centered
      >
        {isSkillLoading || !edit ? (
          <Loader />
        ) : (
          <Stack>
            <Group justify="space-between">
              <Text>Текущий уровень: {edit.proficiency}%</Text>
            </Group>

            <Slider
              value={edit.proficiency}
              onChange={(v) =>
                setEdit((p) => (p ? { ...p, proficiency: v } : p))
              }
              min={0}
              max={100}
              step={1}
              marks={[
                { value: 0, label: "0" },
                { value: 50, label: "50" },
                { value: 100, label: "100" },
              ]}
            />

            <Group justify="right" mt="md">
              <Button
                variant="light"
                color="red"
                loading={deleteState.isLoading}
                onClick={() => handleDelete(selectedId!)}
              >
                Удалить
              </Button>
              <Button loading={updateState.isLoading} onClick={handleSave}>
                Сохранить
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </Card>
  );
}
