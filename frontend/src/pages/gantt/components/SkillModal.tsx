import { Badge, Button, Center, Divider, Group, Loader, Modal, Stack, Text } from "@mantine/core";
import dayjs from "dayjs";
import { diffDaysInclusive, type NormalizedSkill } from "./useGanttLayout";

type Props = { opened: boolean; onClose: () => void; active: NormalizedSkill | null };

export function SkillModal({ opened, onClose, active }: Props) {
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

          {/* Курсы и ссылки — заглушки */}
          <Stack gap={6}>
            <Text fw={600} size="sm">Курсы и ссылки</Text>
            <ul style={{ margin: "4px 0 0 18px" }}>
              <li><a href="#" onClick={(e) => e.preventDefault()}>Курс: Введение в тему (заглушка)</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()}>Курс: Продвинутый уровень (заглушка)</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()}>Статья: Лучшие практики (заглушка)</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()}>Плейлист: Разбор кейсов (заглушка)</a></li>
            </ul>
          </Stack>

          <Group justify="end" mt="sm">
            <Button variant="default" onClick={onClose}>Закрыть</Button>
          </Group>
        </Stack>
      ) : (
        <Center mih={120}><Loader /></Center>
      )}
    </Modal>
  );
}
