import { useMemo, useState } from "react";
import {
  Card, Progress, Modal, Group, Text, Button, Slider, Loader, Stack,
} from "@mantine/core";
import AddSkillModal from "./components/AddSkillModal";
import {
  useGetAllSkillsSelfQuery,
  useGetSkillSelfQuery,
  useUpdateSkillMutation,
  useDeleteSkillMutation,
} from "@/app/redux/api/skill.api";

type SkillItem = {
  id_skill: number;
  proficiency: number;
  priority?: number | null;
  status: string;
};

export default function SkillsSection() {
  const { data: skillsResp, isLoading } = useGetAllSkillsSelfQuery();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [openedAdd, setOpenedAdd] = useState(false);

  const [updateSkill, { isLoading: isUpdating }] = useUpdateSkillMutation();
  const [deleteSkill, { isLoading: isDeleting }] = useDeleteSkillMutation();

  const skills: SkillItem[] = useMemo(() => {
    const list = (skillsResp ?? []) as any[];
    return list.slice().sort((a, b) => {
      const pa = a?.priority ?? Infinity;
      const pb = b?.priority ?? Infinity;
      return pa - pb;
    });
  }, [skillsResp]);

  const { data: selectedSkillMeta } = useGetSkillSelfQuery(selectedId as any, {
    skip: selectedId == null,
  });

  return (
    <Card withBorder className="skills-card">
      <Group justify="space-between" align="center" mb="sm">
        <h2 className="section-title" style={{ margin: 0 }}>Навыки и компетенции</h2>
        <Button onClick={() => setOpenedAdd(true)}>Добавить</Button>
      </Group>

      {isLoading ? (
        <Loader size="sm" />
      ) : (
        <div className="skills-grid">
          {skills.map((s) => (
            <Button
              key={s.id_skill}
              variant="light"
              color="teal"
              radius="md"
              fullWidth
              onClick={() => setSelectedId(s.id_skill)}
              styles={{
                root: { minHeight: 80, paddingTop: 12, paddingBottom: 12, alignItems: "stretch" },
                label: { display: "block", width: "100%" },
              }}
            >
              <Stack gap={8} style={{ width: "100%" }}>
                <Group justify="space-between" align="center" wrap="nowrap">
                  <Text fw={600} lh={1.2} className="skill-name">
                    {(s as any).name ?? `#${s.id_skill}`}
                  </Text>
                  <Text c="dimmed" lh={1} className="skill-level" style={{ flexShrink: 0 }}>
                    {s.proficiency}%
                  </Text>
                </Group>
                <Progress
                  value={Math.max(0, Math.min(100, s.proficiency))}
                  size="sm"
                  radius="xl"
                  mt={4}
                  color="teal"
                />
              </Stack>
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
        {selectedId == null ? null : (
          <SkillModalBody
            skillId={selectedId}
            initialProficiency={skills.find((x) => x.id_skill === selectedId)?.proficiency ?? 0}
            onClose={() => setSelectedId(null)}
            onUpdate={async (prof) => {
              const current = skills.find((x) => x.id_skill === selectedId);
              if (!current) return;
              await updateSkill({
                id_skill: selectedId!,
                proficiency: prof,
                status: current.status,
                priority: current.priority ?? null,
              } as any).unwrap();
            }}
            onDelete={async () => {
              await deleteSkill(selectedId!).unwrap();
              setSelectedId(null);
            }}
            loading={isUpdating || isDeleting}
          />
        )}
      </Modal>
      <AddSkillModal opened={openedAdd} onClose={() => setOpenedAdd(false)} />
    </Card>
  );
}

function SkillModalBody({
  initialProficiency,
  onUpdate,
  onDelete,
  onClose,
  loading,
}: {
  skillId: number;
  initialProficiency: number;
  onUpdate: (p: number) => Promise<void>;
  onDelete: () => Promise<void>;
  onClose: () => void;
  loading: boolean;
}) {
  const [proficiency, setProficiency] = useState(initialProficiency);

  return (
    <Stack gap="md">
      <Group justify="space-between" align="center">
        <Text>Уровень владения</Text>
        <Text fw={600}>{proficiency}%</Text>
      </Group>

      <Slider
        value={proficiency}
        onChange={setProficiency}
        min={0}
        max={100}
        step={1}
        marks={[{ value: 0, label: "0" }, { value: 100, label: "100" }]}
      />

      <Group justify="space-between" mt="xs">
        <Button variant="light" color="red" onClick={onDelete} loading={loading}>
          Удалить
        </Button>
        <Group gap="xs">
          <Button variant="default" onClick={onClose}>
            Отмена
          </Button>
          <Button
            color="teal"
            onClick={async () => {
              await onUpdate(proficiency);
              onClose();
            }}
            loading={loading}
          >
            Сохранить
          </Button>
        </Group>
      </Group>
    </Stack>
  );
}
