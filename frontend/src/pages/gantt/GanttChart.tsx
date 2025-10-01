import { useMemo } from "react";
import {
  Card,
  Title,
  Text,
  Group,
  Badge,
  ActionIcon,
  Tooltip,
  Loader,
  Center,
  SegmentedControl,
  useMantineTheme,
  useMantineColorScheme,
} from "@mantine/core";
import { IconRefresh } from "@tabler/icons-react";
import { useAppSelector } from "@/hooks/useAppSelector";
import { useGetUserSkillProcessesQuery } from "@/app/redux/api/skill.api";

import { useGanttLayout, type NormalizedSkill } from "./components/useGanttLayout";
import { GanttHeader } from "./components/GanttHeader";
import { GanttRow } from "./components/GanttRow";
import { SkillModal } from "./components/SkillModal";
import { SkillProcessI } from "@/shared/types/api/SkillI";

export default function GanttChartPage() {
  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === "dark";

  const user = useAppSelector((s) => s.user.currentUser);
  const userId = user?.id ?? 0;

  const { data, isLoading, refetch } = useGetUserSkillProcessesQuery(userId, {
    skip: !userId,
  });

  const skills = useMemo<NormalizedSkill[]>(
    () =>
      (data ?? []).map((r: SkillProcessI) => {
        const s = new Date(r.start_date);
        const e = new Date(r.end_date);
        const start = s <= e ? s : e;
        const end = e >= s ? e : s;
        return {
          id: r.id_skill,
          title: r.name,
          start,
          end,
          proficiency: r.proficiency,
          priority: r.priority,
          raw: r,
        };
      }),
    [data]
  );

  // Лейаут: измерения, даты, подписи, модалка и т.п.
  const gantt = useGanttLayout(skills);

  // Цвета для «зебры»
  const zebraEven = isDark ? theme.colors.dark[6] : theme.colors.gray[0];
  const zebraOdd = "transparent";
  const gridLine = isDark ? theme.colors.dark[4] : theme.colors.gray[3];

  // Ширина контента таймлайна: либо занимает всю видимую область, либо равна числу дат * ширина дня
  const contentWidthPx = gantt.dates.length * gantt.DAY_PX;
  const contentWidthStyle = `max(100%, ${contentWidthPx}px)`;

  return (
    <>
      <Card withBorder p="md" radius="lg" style={{ overflow: "hidden" }}>
        <Group justify="space-between" mb="sm">
          <Group gap="xs">
            <Title order={3}>Диаграмма Ганта (Навыки)</Title>
            <Badge variant="light" color={theme.primaryColor}>
              {skills.length} навыков
            </Badge>
          </Group>

          <Group gap="xs">
            <SegmentedControl
              size="xs"
              value={gantt.segment}
              onChange={(v) => gantt.setSegment(v as any)}
              data={[
                { value: "days", label: "Дни" },
                { value: "weeks", label: "Недели" },
                { value: "months", label: "Месяцы" },
              ]}
            />
            <Tooltip label="Обновить">
              <ActionIcon variant="default" onClick={() => refetch()}>
                <IconRefresh size={16} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Group>

        {!userId ? (
          <Center mih={200}>
            <Text c="dimmed">Нет выбранного пользователя</Text>
          </Center>
        ) : isLoading ? (
          <Center mih={200}>
            <Loader />
          </Center>
        ) : (
          <div
            // Внешняя таблица — без ref (меряем только правую колонку)
            style={{
              display: "grid",
              gridTemplateColumns: `320px 1fr`,
              minHeight: 240,
              borderRadius: 12,
              border: `1px solid ${gridLine}`,
              overflow: "hidden",
            }}
          >
            {/* Левая колонка: названия навыков + зебра */}
            <div style={{ borderRight: `1px solid ${gridLine}` }}>
              <GanttHeader side="left" headerBg={gantt.headerBg} gridLine={gridLine}>
                Навык
              </GanttHeader>

              <div>
                {skills.map((t, i) => (
                  <div
                    key={`${t.id}-${i}`}
                    style={{
                      height: gantt.ROW_HEIGHT,
                      display: "flex",
                      alignItems: "center",
                      padding: "0 12px",
                      background: i % 2 === 0 ? zebraEven : zebraOdd,
                      borderBottom: `1px solid ${
                        isDark ? theme.colors.dark[5] : theme.colors.gray[2]
                      }`,
                    }}
                  >
                    <Text size="sm" fw={500}>
                      {t.title}
                    </Text>
                    {typeof t.proficiency === "number" && (
                      <Badge
                        ml="xs"
                        size="xs"
                        variant="outline"
                        color={theme.primaryColor}
                        title="Уровень освоения"
                      >
                        {t.proficiency}%
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Правая колонка: таймлайн — scroll-контейнер с ref для измерений */}
            <div
              ref={gantt.timelineRef}
              style={{
                position: "relative",
                overflowX: "auto",
                overflowY: "hidden",
              }}
            >
              {/* Внутренний контент с шириной = max(100%, Npx), чтобы:
                  - заполнять экран при малом количестве дат,
                  - давать горизонтальный скролл при большом количестве дат */}
              <div style={{ width: contentWidthStyle }}>
                {/* Шапка (месяцы/недели/дни) — на русском */}
                <GanttHeader
                  side="right"
                  headerBg={gantt.headerBg}
                  gridLine={gridLine}
                  DAY_PX={gantt.DAY_PX}
                  monthSpans={gantt.monthSpans}
                  weekSpans={gantt.weekSpans}
                  dates={gantt.dates}
                  segment={gantt.segment}
                  textDimmed={gantt.textDimmed}
                />

                {/* ВНИМАНИЕ: вертикальная сетка дней полностью удалена */}

                {/* Ряды с барами */}
                <div style={{ position: "relative" }}>
                  {skills.map((t, rowIndex) => (
                    <GanttRow
                      key={`${t.id}-${rowIndex}`}
                      item={t}
                      rowIndex={rowIndex}
                      gantt={gantt}
                      zebraEven={zebraEven}
                      zebraOdd={zebraOdd}
                      hideDaySplits
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>

      <SkillModal
        opened={gantt.modal.opened}
        onClose={gantt.modal.close}
        active={gantt.modal.active}
      />
    </>
  );
}
