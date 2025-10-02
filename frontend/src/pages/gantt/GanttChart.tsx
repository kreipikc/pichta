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
import type { SkillProcessI } from "@/shared/types/api/SkillI";
import {
  NormalizedSkill,
  useGanttLayout,
} from "./components/useGanttLayout";
import { GanttHeader } from "./components/GanttHeader";
import { SkillModal } from "./components/SkillModal";

export default function GanttChart() {
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

  const gantt = useGanttLayout(skills);

  // Цвета для «зебры»
  const zebraEven = isDark ? theme.colors.dark[6] : theme.colors.gray[0];
  const zebraOdd = "transparent";
  const gridLine = isDark ? theme.colors.dark[4] : theme.colors.gray[3];

  // Ширина контента таймлайна + показ скролла только при реальной необходимости
  const contentWidthPx = gantt.dates.length * gantt.DAY_PX;
  const contentWidthStyle = `max(100%, ${contentWidthPx}px)`;
  const showScroll = contentWidthPx > gantt.timelineWidth + 1;

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
              value={gantt.segment}
              onChange={(v) =>
                gantt.setSegment(v as "days" | "weeks" | "months")
              }
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
                    {typeof t.priority === "number" && (
                      <Badge
                        ml="xs"
                        size="xs"
                        variant="light"
                        color="orange"
                        title="Приоритет"
                      >
                        P{t.priority}
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
                overflowX: showScroll ? "auto" : "hidden",
                overflowY: "hidden",
              }}
            >
              {/* Внутренний контент: ширина = max(100%, Npx).
                  Так он либо занимает весь экран, либо даёт горизонтальный скролл. */}
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

                {/* Ряд за рядом: зебра + бары (без дневной сетки) */}
                <div>
                  {skills.map((t, i) => (
                    <div
                      key={`${t.id}-${i}-row`}
                      style={{
                        height: gantt.ROW_HEIGHT,
                        position: "relative",
                        background: i % 2 === 0 ? zebraEven : zebraOdd,
                        borderBottom: `1px solid ${gridLine}`,
                      }}
                    >
                      {/* Бар */}
                      <div
                        onClick={() => gantt.modal.openModal(t)}
                        title={`${t.title}: ${t.start.toLocaleDateString()} — ${t.end.toLocaleDateString()}`}
                        style={{
                          position: "absolute",
                          left: gantt.leftOffsetPx(t.start),
                          top: 6,
                          height: gantt.ROW_HEIGHT - 12,
                          width: gantt.widthPx(t.start, t.end),
                          borderRadius: 8,
                          border: `1px solid ${
                            isDark ? theme.colors.dark[3] : theme.colors.gray[3]
                          }`,
                          background: isDark
                            ? theme.colors.teal[9]
                            : theme.colors.teal[2],
                          boxShadow: isDark
                            ? "inset 0 -1px 0 rgba(255,255,255,0.04)"
                            : "inset 0 -1px 0 rgba(0,0,0,0.06)",
                          cursor: "pointer",
                        }}
                      />
                    </div>
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
