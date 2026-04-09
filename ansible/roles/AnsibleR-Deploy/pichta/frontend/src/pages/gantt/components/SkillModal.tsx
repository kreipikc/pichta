import {
  Badge,
  Button,
  Center,
  Divider,
  Group,
  Loader,
  Modal,
  Stack,
  Text,
  Anchor,
  Popover,
  NumberInput,
  Slider,
} from "@mantine/core";
import dayjs from "dayjs";
import {
  diffDaysInclusive,
  type NormalizedSkill,
} from "./useGanttLayout";
import styles from "../GanttChartPage.module.css";

import {
  useGetAllSkillsQuery,
  useGetSkillCoursesQuery,
  useUpdateSkillMutation,
} from "@/app/redux/api/skill.api";
import { useAppSelector } from "@/hooks/useAppSelector";
import { useState, useEffect } from "react";

type Props = {
  opened: boolean;
  onClose: () => void;
  active: NormalizedSkill | null;
};

export function SkillModal({ opened, onClose, active }: Props) {
  const userId = useAppSelector((s) => s.user.currentUser?.id);

  // чтобы найти skillId, если его нет явно у active
  const { data: allSkills } = useGetAllSkillsQuery(undefined, {
    skip: !opened,
  });

  const [skillId, setSkillId] = useState<number | undefined>(undefined);

  useEffect(() => {
    const existingId =
      (active as any)?.skillId ??
      (active as any)?.raw?.skill_id ??
      (allSkills
        ? allSkills.find(
            (s) =>
              s.name.toLowerCase() ===
              String(active?.title ?? "").toLowerCase()
          )?.id
        : undefined);
    setSkillId(existingId);
  }, [active, allSkills]);

  // курсы для навыка
  const {
    data: courses,
    isFetching: coursesLoading,
    isError: coursesError,
  } = useGetSkillCoursesQuery(skillId as number, {
    skip: !opened || !skillId,
  });

  // редактирование процента освоения
  const [openedEdit, setOpenedEdit] = useState(false);
  const [tmp, setTmp] = useState<number | null>(
    (active as any)?.proficiency ?? null
  );
  const [updateSkill] = useUpdateSkillMutation();

  // при открытии модалки под новый skill сбрасываем временное значение
  useEffect(() => {
    if (opened && active) {
      setTmp((active as any)?.proficiency ?? 0);
    }
  }, [opened, active]);

  const saveProgress = async () => {
    if (!userId || !skillId) return;
    if (typeof tmp !== "number") return;

    const value = Math.max(0, Math.min(100, tmp));

    try {
      await updateSkill({
        user_id: Number(userId),
        skill_id: Number(skillId),
        body: { proficiency: value } as any,
      }).unwrap();

      // 🔥 Оптимистично обновляем модалку и сам активный объект,
      // чтобы UI сразу показал новый % без рефетча
      if (active) {
        (active as any).proficiency = value;
      }
      setTmp(value);
      setOpenedEdit(false);
    } catch {
      // можно повесить уведомление об ошибке
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      title={active?.title ?? "Навык"}
      size="lg"
      radius="md"
    >
      {active ? (
        <Stack gap="sm">
          {/* верх: бейджи и поповер редактирования прогресса */}
          <Group justify="space-between" wrap="wrap">
            <Group gap="xs">
              {typeof (active as any).proficiency === "number" && (
                <Badge variant="outline" color="teal" title="Прогресс">
                  {(active as any).proficiency}% освоения
                </Badge>
              )}
              {typeof (active as any).priority === "number" && (
                <Badge variant="light" color="yellow" title="Приоритет">
                  Приоритет P{(active as any).priority}
                </Badge>
              )}
            </Group>

            <Popover
              opened={openedEdit}
              onChange={setOpenedEdit}
              position="bottom-end"
              withArrow
              shadow="md"
            >
              <Popover.Target>
                <Button
                  size="xs"
                  variant="light"
                  onClick={() => {
                    setTmp((active as any)?.proficiency ?? 0);
                    setOpenedEdit((v) => !v);
                  }}
                  disabled={!skillId}
                >
                  Изменить прогресс
                </Button>
              </Popover.Target>

              <Popover.Dropdown>
                <Stack gap="xs" w={260}>
                  <NumberInput
                    label="Освоение (%)"
                    min={0}
                    max={100}
                    value={tmp ?? undefined}
                    onChange={(v) => {
                      if (typeof v === "number") {
                        setTmp(v);
                      } else if (v === undefined) {
                        setTmp(0);
                      }
                    }}
                  />

                  <Slider
                    value={tmp ?? 0}
                    onChange={(val: number) => setTmp(val)}
                    min={0}
                    max={100}
                    step={1}
                  />

                  <Group justify="end" gap="xs">
                    <Button
                      size="xs"
                      variant="default"
                      onClick={() => setOpenedEdit(false)}
                    >
                      Отмена
                    </Button>
                    <Button size="xs" onClick={saveProgress}>
                      Сохранить
                    </Button>
                  </Group>
                </Stack>
              </Popover.Dropdown>
            </Popover>
          </Group>

          <Text size="sm" c="dimmed">
            Период: {dayjs(active.start).format("DD.MM.YYYY")} →{" "}
            {dayjs(active.end).format("DD.MM.YYYY")} (
            {diffDaysInclusive(
              dayjs(active.start).startOf("day"),
              dayjs(active.end).endOf("day")
            )}{" "}
            дн.)
          </Text>

          <Divider />

          {/* Курсы и ссылки */}
          <Stack gap={6}>
            <Text fw={600} size="sm">
              Курсы и ссылки
            </Text>

            {!skillId ? (
              <Text c="dimmed" size="sm">
                Не удалось определить идентификатор навыка для «
                {active.title}». Проверьте словарь навыков.
              </Text>
            ) : coursesLoading ? (
              <Center mih={60}>
                <Loader size="sm" />
              </Center>
            ) : coursesError ? (
              <Text c="red" size="sm">
                Не удалось загрузить курсы. Попробуйте позже.
              </Text>
            ) : !courses || courses.length === 0 ? (
              <Text c="dimmed" size="sm">
                Для этого навыка курсы не найдены.
              </Text>
            ) : (
              <ul className={styles.courseList}>
                {courses.map((c) => (
                  <li key={c.id} className={styles.courseItem}>
                    <Anchor
                      href={c.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.courseLink}
                      title={c.url}
                    >
                      {c.title || c.url}
                    </Anchor>
                  </li>
                ))}
              </ul>
            )}
          </Stack>

          <Group justify="end" mt="sm">
            <Button variant="default" onClick={onClose}>
              Закрыть
            </Button>
          </Group>
        </Stack>
      ) : (
        <Center mih={120}>
          <Loader />
        </Center>
      )}
    </Modal>
  );
}
