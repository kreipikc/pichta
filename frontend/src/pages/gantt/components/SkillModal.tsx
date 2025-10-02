import { Badge, Button, Center, Divider, Group, Loader, Modal, Stack, Text, Anchor } from "@mantine/core";
import dayjs from "dayjs";
import { diffDaysInclusive, type NormalizedSkill } from "./useGanttLayout";

// API-хуки для навыков/курсов
import { useGetAllSkillsQuery, useGetSkillCoursesQuery } from "@/app/redux/api/skill.api";

type Props = { opened: boolean; onClose: () => void; active: NormalizedSkill | null };

export function SkillModal({ opened, onClose, active }: Props) {
  // 1) Если в NormalizedSkill нет id навыка — найдём по названию
  const { data: allSkills } = useGetAllSkillsQuery(undefined, { skip: !opened });
  const skillId =
    (active as any)?.skillId ??
    (allSkills
      ? allSkills.find((s) => s.name.toLowerCase() === String(active?.title ?? "").toLowerCase())?.id
      : undefined);

  // 2) Тянем курсы по найденному skillId
  const {
    data: courses,
    isFetching: coursesLoading,
    isError: coursesError,
  } = useGetSkillCoursesQuery(skillId as number, { skip: !opened || !skillId });

  return (
    <Modal opened={opened} onClose={onClose} centered title={active?.title ?? "Навык"} size="lg" radius="md">
      {active ? (
        <Stack gap="sm">
          {/* красивые бейджи под заголовком */}
          <Group gap="xs">
            {typeof active.proficiency === "number" && (
              <Badge variant="outline" color="teal" title="Прогресс">
                {active.proficiency}% освоения
              </Badge>
            )}
            {typeof active.priority === "number" && (
              <Badge variant="light" color="yellow" title="Приоритет">
                Приоритет P{active.priority}
              </Badge>
            )}
          </Group>

          <Text size="sm" c="dimmed">
            Период: {dayjs(active.start).format("DD.MM.YYYY")} → {dayjs(active.end).format("DD.MM.YYYY")} (
            {diffDaysInclusive(dayjs(active.start).startOf("day"), dayjs(active.end).endOf("day"))} дн.)
          </Text>

          <Divider />

          {/* Курсы с бэка */}
          <Stack gap={6}>
            <Text fw={600} size="sm">
              Курсы и ссылки
            </Text>

            {!skillId ? (
              <Text c="dimmed" size="sm">
                Не удалось определить идентификатор навыка для «{active.title}». Проверьте словарь навыков.
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
              <ul style={{ margin: "4px 0 0 18px" }}>
                {courses.map((c) => (
                  <li key={c.id} style={{ margin: "4px 0" }}>
                    <Anchor href={c.url} target="_blank" rel="noopener noreferrer">
                      {c.url}
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
