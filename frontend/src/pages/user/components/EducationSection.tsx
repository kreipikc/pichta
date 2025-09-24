import { useEffect, useMemo, useState } from "react";
import { Card, Button, Group, Paper, Text, Loader, Stack, Badge } from "@mantine/core";
import dayjs from "dayjs";

import { useEducation } from "@/hooks/useEducation";
import { useExperience } from "@/hooks/useExperience";

import EducationModal, { type EducationModalValue } from "./components/EducationModal";
import ExperienceModal, { type ExperienceModalValue } from "./components/ExperienceModal";

import type { EducationResponseI } from "@/shared/types/api/EducationI";
import type { ExperienceResponseI } from "@/shared/types/api/ExperienceI";

export default function EducationSection({ userId }: { userId: number }) {
  const edu = useEducation(userId);
  const exp = useExperience(userId);

  useEffect(() => {
    if (userId) {
      edu.refetch();
      exp.refetch();
    }
  }, [userId]);

  const [eduModalOpen, setEduModalOpen] = useState(false);
  const [expModalOpen, setExpModalOpen] = useState(false);

  const [editingEdu, setEditingEdu] = useState<EducationModalValue | null>(null);
  const [editingExp, setEditingExp] = useState<ExperienceModalValue | null>(null);

  const emptyEdu = useMemo<EducationModalValue>(
    () => ({ type: "", direction: "", start_time: null, end_time: null }),
    []
  );
  const emptyExp = useMemo<ExperienceModalValue>(
    () => ({ title: "", id_profession: null, description: "", start_time: dayjs().toISOString(), end_time: null }),
    []
  );

  const period = (start?: string | null, end?: string | null) =>
    `${start ? dayjs(start).format("YYYY.MM") : "—"} — ${end ? dayjs(end).format("YYYY.MM") : "по наст."}`;

  const isLoading = edu.isLoading || exp.isLoading;

  const openCreateEducation = () => { setEditingEdu(emptyEdu); setEduModalOpen(true); };
  const openEditEducation   = (item: EducationModalValue) => { setEditingEdu(item); setEduModalOpen(true); };
  const handleSaveEducation = async (payload: EducationModalValue) => {
    const normalized = {
      type: payload.type ?? "",
      direction: payload.direction ?? "",
      start_time: payload.start_time ?? null,
      end_time: payload.end_time ?? null,
    };
    if (payload.id) await edu.update(payload.id, normalized); else await edu.add(normalized);
    setEduModalOpen(false); setEditingEdu(null);
  };
  const handleDeleteEducation = async (id: number) => { await edu.remove(id); };

  const openCreateExperience = () => { setEditingExp(emptyExp); setExpModalOpen(true); };
  const openEditExperience   = (item: ExperienceModalValue) => { setEditingExp(item); setExpModalOpen(true); };
  const handleSaveExperience = async (payload: ExperienceModalValue) => {
    const normalized = {
      title: payload.title ?? "",
      id_profession: payload.id_profession ?? null,
      description: payload.description ?? null,
      start_time: payload.start_time!,
      end_time: payload.end_time ?? null,
    };
    if (payload.id) await exp.update(payload.id, normalized); else await exp.add(normalized);
    setExpModalOpen(false); setEditingExp(null);
  };
  const handleDeleteExperience = async (id: number) => { await exp.remove(id); };

  return (
    <Stack gap="lg">
      <Card withBorder radius="lg" p="lg">
        <Group justify="space-between" mb="md">
          <Text fw={700}>Образование</Text>
          <Button onClick={openCreateEducation} leftSection={<span>＋</span>}>Добавить</Button>
        </Group>
        <Stack>
          {edu.list.map((e: EducationResponseI) => (
            <Paper key={e.id} p="md" radius="md" withBorder>
              <Group justify="space-between" align="start">
                <div>
                  <Group gap="sm" align="center">
                    <Text fw={600}>{e.type}</Text>
                    <Badge variant="light">{period(e.start_time ?? null, e.end_time ?? null)}</Badge>
                  </Group>
                  <Text c="dimmed" size="sm">{e.direction}</Text>
                </div>
                <Group gap="xs">
                  <Button variant="subtle" onClick={() => openEditEducation(e)}>Редактировать</Button>
                  <Button variant="subtle" color="red" onClick={() => handleDeleteEducation(e.id)}>Удалить</Button>
                </Group>
              </Group>
            </Paper>
          ))}
          {edu.list.length === 0 && <Text c="dimmed">Записей нет</Text>}
        </Stack>
      </Card>

      <Card withBorder radius="lg" p="lg">
        <Group justify="space-between" mb="md">
          <Text fw={700}>Опыт работы</Text>
          <Button onClick={openCreateExperience} leftSection={<span>＋</span>}>Добавить</Button>
        </Group>
        <Stack>
          {exp.list.map((e: ExperienceResponseI) => (
            <Paper key={e.id} p="md" radius="md" withBorder>
              <Group justify="space-between" align="start">
                <div>
                  <Group gap="sm" align="center">
                    <Text fw={600}>{e.title}</Text>
                    <Badge variant="light">{period(e.start_time, e.end_time ?? null)}</Badge>
                  </Group>
                  {e.description && <Text c="dimmed" size="sm">{e.description}</Text>}
                </div>
                <Group gap="xs">
                  <Button variant="subtle" onClick={() => openEditExperience(e)}>Редактировать</Button>
                  <Button variant="subtle" color="red" onClick={() => handleDeleteExperience(e.id)}>Удалить</Button>
                </Group>
              </Group>
            </Paper>
          ))}
          {exp.list.length === 0 && <Text c="dimmed">Записей нет</Text>}
        </Stack>
      </Card>

      <EducationModal
        opened={eduModalOpen}
        onClose={() => { setEduModalOpen(false); setEditingEdu(null); }}
        value={editingEdu ?? emptyEdu}
        onSave={handleSaveEducation}
      />
      <ExperienceModal
        opened={expModalOpen}
        onClose={() => { setExpModalOpen(false); setEditingExp(null); }}
        value={editingExp ?? emptyExp}
        onSave={handleSaveExperience}
      />
    </Stack>
  );
}
