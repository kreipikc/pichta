import { Modal, Stack, Title, Text, Paper, Group, Button, Divider, ScrollArea, List, ThemeIcon } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useMemo } from 'react';
import dayjs from 'dayjs';

import { useQuestionnaire } from '../context/QuestionnaireContext';

import { useGetMeQuery } from '@/app/redux/api/auth.api';
import { useAddEducationMutation } from '@/app/redux/api/education.api';
import { useAddExperienceForSelfMutation } from '@/app/redux/api/experience.api';
import { useAddWantedProfessionsMutation } from '@/app/redux/api/me.api';
import { useAddSkillMutation, useGetAllSkillsQuery } from '@/app/redux/api/skill.api';
import { useGetAllProfessionQuery } from '@/app/redux/api/profession.api';
import { useAppSelector } from '@/hooks/useAppSelector';

import type { EducationCreateI } from '@/shared/types/api/EducationI';
import type { ExperienceCreateI } from '@/shared/types/api/ExperienceI';
import type { WantedProfessionCreateI } from '@/shared/types/api/ForMyselfI';
import type { UserSkillCreateI } from '@/shared/types/api/SkillI';

interface Props {
  opened: boolean;
  onClose: () => void;
}

const LEVEL_ORDER: Record<string, number> = { Lead: 5, Senior: 4, Middle: 3, Junior: 2, Intern: 1 };

export default function SummaryModal({ opened, onClose }: Props) {
  const { data } = useQuestionnaire();
  const navigate = useNavigate();

  // user id
  const { data: me } = useGetMeQuery();
  const userFromStore = useAppSelector((s) => s.user?.currentUser);
  const userId: number | undefined = (userFromStore as any)?.id ?? (me as any)?.id;

  // словари
  const { data: skillsDict } = useGetAllSkillsQuery();
  const { data: professionsDict } = useGetAllProfessionQuery();

  // мутации
  const [addEducation] = useAddEducationMutation();
  const [addExperience] = useAddExperienceForSelfMutation();
  const [addWanted] = useAddWantedProfessionsMutation();
  const [addSkills] = useAddSkillMutation();

  // нормализованные массивы из формы
  const educationList = Array.isArray((data as any).educationList) ? (data as any).educationList : [];
  const experienceList = Array.isArray((data as any).experienceList) ? (data as any).experienceList : [];

  const selectedWantedIds = useMemo(
    () => (data.goals ? data.goals.split('||').filter(Boolean).map(Number) : []),
    [data.goals]
  );

  const selectedWantedNames = useMemo(() => {
    if (!professionsDict) return [];
    const byId = new Map<number, string>();
    professionsDict.forEach((p: any) => byId.set(p.id, p.name));
    return selectedWantedIds.map((id) => byId.get(id)).filter(Boolean) as string[];
  }, [professionsDict, selectedWantedIds]);

  const aboutText =
    (data as any).about ||
    (data as any).orientation ||
    (me as any)?.about_me ||
    '—';

  const highestPosition = useMemo(() => {
    if (experienceList.length === 0) return '';
    const sorted = [...experienceList].sort((a, b) => (LEVEL_ORDER[b.level] || 0) - (LEVEL_ORDER[a.level] || 0));
    const highest = sorted[0];
    return `${highest.level} ${highest.name}`;
  }, [experienceList]);

  const isWantedValid = selectedWantedIds.length > 0;

  const handleConfirm = async () => {
    if (!userId) {
      onClose();
      return;
    }

    // Жёсткое требование: минимум одна желаемая профессия
    if (!isWantedValid) {
      // мягко — просто блокируем, без уведомлений
      return;
    }

    // 1) Education — с обязательным start_time
    for (const e of educationList) {
      if (!e?.institution && !e?.degree) continue;
      const startIso = e.start ?? dayjs().startOf('day').toISOString();
      const edu: EducationCreateI = {
        id_user: userId,
        type: e.degree || 'Не указано',
        direction: e.institution || 'Не указано',
        start_time: startIso,
        end_time: e.end ?? null,
      };
      await addEducation(edu).unwrap();
    }

    // 2) Experience — self endpoint; start_time обязателен
    for (const exp of experienceList) {
      if (!exp?.name) continue;
      const startIso = exp.start ?? dayjs().startOf('day').toISOString();
      const payload: ExperienceCreateI = {
        title: `${exp.level ?? ''} ${exp.name}`.trim(),
        id_profession: null,
        description: exp.description ?? null,
        start_time: startIso,
        end_time: exp.end ?? null,
      };
      await addExperience(payload).unwrap();
    }

    // 3) Wanted professions — теперь обязательно есть хотя бы 1
    const body: WantedProfessionCreateI[] = selectedWantedIds.map((id_profession) => ({ id_profession }));
    await addWanted(body).unwrap();

    // 4) Skills
    const dict = new Map<string, number>();
    (skillsDict ?? []).forEach((s: any) => dict.set(s.name, s.id));
    const skillsPayload: UserSkillCreateI[] = (data.skills || [])
      .map((name: string) => (dict.has(name) ? dict.get(name)! : null))
      .filter((id): id is number => typeof id === 'number')
      .map((id_skill) => ({
        id_skill,
        id_user: userId,
        proficiency: 100,
        priority: null,
        start_date: null,
        end_date: null,
        status: 'active',
      }));
    if (skillsPayload.length) await addSkills(skillsPayload).unwrap();

    onClose();
    navigate('/');
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={<Title order={3}>Подтверждение анкеты</Title>}
      size="xl"
      centered
      keepMounted={false}
    >
      <ScrollArea.Autosize mah="70vh" type="scroll">
        <Stack gap="md">
          <Paper withBorder p="md">
            <Text fw={600}>О себе</Text>
            <Text>{aboutText}</Text>
          </Paper>

          <Paper withBorder p="md">
            <Text fw={600}>Образование</Text>
            {educationList.length ? (
              <List
                spacing="xs"
                size="sm"
                icon={
                  <ThemeIcon color="teal" size={18} radius="xl">
                    <IconCheck size={14} />
                  </ThemeIcon>
                }
              >
                {educationList.map((e: any, i: number) => (
                  <List.Item key={`edu-${i}`}>
                    {e.degree || '—'} — {e.institution || '—'}{' '}
                    ({e.start ? dayjs(e.start).format('YYYY-MM-DD') : '—'}
                    {' '}–{' '}
                    {e.end ? dayjs(e.end).format('YYYY-MM-DD') : 'по наст. время'})
                  </List.Item>
                ))}
              </List>
            ) : (
              <Text>—</Text>
            )}
          </Paper>

          <Paper withBorder p="md">
            <Text fw={600}>Опыт</Text>
            {experienceList.length ? (
              <List
                spacing="xs"
                size="sm"
                icon={
                  <ThemeIcon color="teal" size={18} radius="xl">
                    <IconCheck size={14} />
                  </ThemeIcon>
                }
              >
                {experienceList.map((exp: any, i: number) => (
                  <List.Item key={`exp-${i}`}>
                    {(exp.level ? `${exp.level} ` : '') + (exp.name || '—')}{' '}
                    ({exp.start ? dayjs(exp.start).format('YYYY-MM-DD') : '—'}
                    {' '}–{' '}
                    {exp.end ? dayjs(exp.end).format('YYYY-MM-DD') : 'по наст. время'})
                    {exp.description ? ` — ${exp.description}` : ''}
                  </List.Item>
                ))}
              </List>
            ) : (
              <Text>—</Text>
            )}
            {highestPosition && (
              <Text c="dimmed" mt="xs">
                Самая высокая позиция: {highestPosition}
              </Text>
            )}
          </Paper>

          <Paper withBorder p="md">
            <Text fw={600}>Желаемые профессии</Text>
            {selectedWantedNames.length ? (
              <List
                spacing="xs"
                size="sm"
                icon={
                  <ThemeIcon color="teal" size={18} radius="xl">
                    <IconCheck size={14} />
                  </ThemeIcon>
                }
              >
                {selectedWantedNames.map((n, i) => (
                  <List.Item key={`${n}-${i}`}>{n}</List.Item>
                ))}
              </List>
            ) : (
              <Text c="red">Не выбрано ни одной профессии</Text>
            )}
          </Paper>

          <Paper withBorder p="md">
            <Text fw={600}>Навыки</Text>
            {data.skills?.length ? <Text>{data.skills.join(', ')}</Text> : <Text>—</Text>}
          </Paper>

          <Divider />
          <Group justify="flex-end">
            <Button variant="default" onClick={onClose}>Отмена</Button>
            <Button color="teal" onClick={handleConfirm} disabled={!isWantedValid}>
              Подтвердить и сохранить
            </Button>
          </Group>
        </Stack>
      </ScrollArea.Autosize>
    </Modal>
  );
}
