import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  Card,
  Title,
  Text,
  Group,
  ActionIcon,
  Tooltip,
  Loader,
  Center,
  SegmentedControl,
  Badge,
  useMantineTheme,
  useMantineColorScheme,
} from "@mantine/core";
import { IconRefresh } from "@tabler/icons-react";
import { useAppSelector } from "@/hooks/useAppSelector";
import { useGetUserSkillProcessesQuery } from "@/app/redux/api/skill.api";

import { NormalizedSkill, useGanttLayout } from "./components/useGanttLayout";
import { GanttHeader } from "./components/GanttHeader";
import { SkillModal } from "./components/SkillModal";

type NSkill = NormalizedSkill & {
  proficiency?: number;
  priority?: number;
  skillId?: number;
};

export default function GanttChart() {
  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === "dark";

  const user = useAppSelector((s) => s.user.currentUser);
  const userId = user?.id ?? 0;

  const { data, isLoading, refetch } = useGetUserSkillProcessesQuery(userId, {
    skip: !userId,
  });

  // Универсальный нормалайзер/API-мэппер
  const skills = useMemo<NSkill[]>(
    () =>
      ((data as any[]) ?? []).map((r: any, i: number) => {
        const rawStart =
          r.start ?? r.date_start ?? r.start_date ?? r.started_at ?? r.begin ?? r.dateStart ?? r.dateFrom;
        const rawEnd =
          r.end ?? r.date_end ?? r.end_date ?? r.finished_at ?? r.finish ?? r.dateEnd ?? r.dateTo;

        const s = rawStart ? new Date(rawStart) : new Date();
        const start = isNaN(s.getTime()) ? new Date() : s;

        const e = rawEnd ? new Date(rawEnd) : new Date(start.getFullYear(), start.getMonth(), start.getDate() + 7);
        const end = isNaN(e.getTime()) ? new Date(start.getFullYear(), start.getMonth(), start.getDate() + 7) : e;

        const id = r.id ?? r.id_skill_process ?? r.id_skill ?? r.skill_id ?? r.process_id ?? `row-${i}`;
        const title = r.skill?.name ?? r.title ?? r.name ?? r.skill_name ?? "Навык";
        const color = r.skill?.color ?? r.color ?? undefined;

        const proficiency = r.proficiency ?? r.progress ?? r.percent ?? r.completion ?? undefined;
        const priority = r.priority ?? r.importance ?? r.rank ?? undefined;
        const skillId = r.skill?.id ?? r.skill_id ?? r.id_skill ?? undefined;

        return { id, title, start, end, color, proficiency, priority, skillId } as NSkill;
      }),
    [data]
  );

  const gantt = useGanttLayout(skills);

  const textDimmed = isDark ? theme.colors.dark[2] : theme.colors.gray[6];
  const zebraEven = isDark ? theme.colors.dark[6] : theme.colors.gray[0];
  const zebraOdd = "transparent";
  const gridLine = isDark ? theme.colors.dark[4] : theme.colors.gray[3];

  // --- ширина контента таймлайна и скрытие горизонтального скролла до первого измерения
  const contentWidthPx = gantt.dates.length * gantt.DAY_PX;
  const hasMeasured = gantt.timelineWidth > 0;
  const showScroll = hasMeasured && contentWidthPx > gantt.timelineWidth + 1;
  const contentWidthStyle = hasMeasured ? `max(100%, ${contentWidthPx}px)` : "100%";

  // --- синхронизация высоты шапок: слева высота = правой (две строки)
  const rightHeaderRef = useRef<HTMLDivElement | null>(null);
  const [rightHeaderH, setRightHeaderH] = useState<number>(64);

  useEffect(() => {
    const el = rightHeaderRef.current;
    if (!el) return;
    const measure = () => setRightHeaderH(el.getBoundingClientRect().height || 64);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [gantt.segment, gantt.dates.length]);

  // --- hover-лейбл без фона, следит за мышью и не уходит за границы
  const [hovered, setHovered] = useState<NSkill | null>(null);
  const [mouse, setMouse] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [labelSize, setLabelSize] = useState<{ w: number; h: number }>({ w: 0, h: 0 });
  const labelRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    if (!labelRef.current) return;
    const rect = labelRef.current.getBoundingClientRect();
    setLabelSize({ w: rect.width, h: rect.height });
  }, [hovered]);

  const onTimelineMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!hovered) return;
    const el = gantt.timelineRef.current as HTMLDivElement | null;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setMouse({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const computeLabelPos = () => {
    const el = gantt.timelineRef.current as HTMLDivElement | null;
    if (!el) return { left: 0, top: 0 };
    const padding = 8;
    const offset = 14;
    const containerW = el.clientWidth;
    const containerH = el.clientHeight;
    const w = labelSize.w || 220;
    const h = labelSize.h || 60;

    const tryRight = mouse.x + offset + w <= containerW - padding;
    let left = tryRight ? mouse.x + offset : mouse.x - offset - w;

    let top = mouse.y - h / 2;

    left = Math.max(padding, Math.min(left, containerW - w - padding));
    top = Math.max(padding, Math.min(top, containerH - h - padding));

    return { left, top };
  };

  const fmtRu = (d: Date) => d.toLocaleDateString("ru-RU");

  return (
    <>
      <Card withBorder p="md" radius="lg" style={{ overflow: "hidden" }}>
        {/* Верхняя строка: заголовок + овальный счётчик рядом */}
        <Group justify="space-between" align="center" mb="md">
          <Group gap="sm" align="center">
            <Title order={3}>Диаграмма Ганта</Title>
            <Badge radius="xl" variant="outline">
              <Text span fw={700} mr={4}>{skills.length}</Text>навыков
            </Badge>
          </Group>

          <Group gap="xs">
            <SegmentedControl
              size="xs"
              value={gantt.segment}
              onChange={(v) => gantt.setSegment(v as typeof gantt.segment)}
              data={[
                { label: "Дни", value: "days" },
                { label: "Недели", value: "weeks" },
                { label: "Месяцы", value: "months" },
              ]}
            />
            <Tooltip label="Обновить">
              <ActionIcon variant="light" onClick={() => refetch()}>
                <IconRefresh size={16} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Group>

        {!userId ? (
          <Center mih={160}>
            <Text c="dimmed">Сначала войдите в систему</Text>
          </Center>
        ) : isLoading ? (
          <Center mih={160}>
            <Loader />
          </Center>
        ) : skills.length === 0 ? (
          <Center mih={160}>
            <Text c="dimmed">Нет навыков для изучения</Text>
          </Center>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `320px 1fr`,
              minHeight: 240,
              borderRadius: 12,
              border: `1px solid ${gridLine}`,
              overflow: "hidden",
            }}
          >
            {/* Левая колонка */}
            <div
              style={{
                position: "relative",
                borderRight: `1px solid ${gridLine}`,
              }}
            >
              {/* Шапка слева: по высоте правой */}
              <div
                style={{
                  position: "sticky",
                  top: 0,
                  zIndex: 2,
                  background: gantt.headerBg,
                  borderBottom: `1px solid ${gridLine}`,
                  height: rightHeaderH,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Group justify="space-between" px="md" w="100%">
                  <Text fw={600} size="sm" c={textDimmed}>
                    Навык
                  </Text>
                  <Text fw={600} size="sm" c={textDimmed}>
                    Период
                  </Text>
                </Group>
              </div>

              {/* Ряды */}
              <div>
                {skills.map((t, i) => (
                  <div
                    key={`${t.id}-${i}`}
                    style={{
                      height: gantt.ROW_HEIGHT,
                      display: "grid",
                      gridTemplateColumns: "1fr auto",
                      alignItems: "center",
                      padding: "0 12px",
                      background: i % 2 === 0 ? zebraEven : zebraOdd,
                      borderBottom: `1px solid ${gridLine}`,
                    }}
                  >
                    <Text fw={500} lineClamp={1} title={t.title}>
                      {t.title}
                    </Text>
                    <Text size="sm" c={textDimmed}>
                      {fmtRu(t.start)} — {fmtRu(t.end)}
                    </Text>
                  </div>
                ))}
              </div>
            </div>

            {/* Правая колонка: таймлайн */}
            <div
              ref={gantt.timelineRef}
              onMouseMove={onTimelineMouseMove}
              style={{
                position: "relative",
                overflowX: showScroll ? "auto" : "hidden",
                overflowY: "hidden",
                // @ts-ignore
                scrollbarGutter: "stable both-edges",
              }}
            >
              {/* Правый заголовок — обёртка для измерения высоты */}
              <div ref={rightHeaderRef}>
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
              </div>

              {/* Контент таймлайна */}
              <div style={{ width: contentWidthStyle }}>
                {skills.map((t, i) => {
                  const leftPx = gantt.leftOffsetPx(t.start);
                  const widthPx = gantt.widthPx(t.start, t.end);

                  return (
                    <div
                      key={`${t.id}-${i}-row`}
                      style={{
                        height: gantt.ROW_HEIGHT,
                        position: "relative",
                        background: i % 2 === 0 ? zebraEven : zebraOdd,
                        borderBottom: `1px solid ${gridLine}`,
                        userSelect: "none",
                      }}
                    >
                      {/* Сам бар */}
                      <div
                        onClick={() => gantt.modal.openModal(t)}
                        onMouseEnter={() => setHovered(t)}
                        onMouseLeave={() => setHovered(null)}
                        style={{
                          position: "absolute",
                          left: leftPx,
                          top: 6,
                          height: gantt.ROW_HEIGHT - 12,
                          width: widthPx,
                          borderRadius: 8,
                          border: `1px solid ${isDark ? theme.colors.dark[3] : theme.colors.gray[3]}`,
                          background: isDark ? theme.colors.teal[9] : theme.colors.teal[2],
                          boxShadow: isDark
                            ? "inset 0 -1px 0 rgba(255,255,255,0.04)"
                            : "inset 0 -1px 0 rgba(0,0,0,0.06)",
                          cursor: "pointer",
                          transition: "transform 120ms ease",
                        }}
                      />
                    </div>
                  );
                })}

                {/* Ховер-лейбл без фона: колонкой, закреплён внутри контейнера */}
                {hovered && (
                  <div
                    ref={labelRef}
                    style={{
                      position: "absolute",
                      ...computeLabelPos(),
                      pointerEvents: "none",
                      zIndex: 3,
                      color: isDark ? theme.white : theme.black,
                      textShadow: isDark
                        ? "0 1px 2px rgba(0,0,0,0.7)"
                        : "0 1px 2px rgba(0,0,0,0.30)",
                      maxWidth: 280,
                      lineHeight: 1.2,
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    <div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {hovered.title}
                    </div>
                    {typeof hovered.proficiency === "number" && (
                      <div>Освоенность: {hovered.proficiency}%</div>
                    )}
                    {typeof hovered.priority === "number" && (
                      <div>Приоритет: P{hovered.priority}</div>
                    )}
                    <div>
                      Сроки: {fmtRu(hovered.start)} — {fmtRu(hovered.end)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Card>

      <SkillModal
        opened={gantt.modal.opened}
        onClose={gantt.modal.close}
        active={gantt.modal.active as NSkill | null}
      />
    </>
  );
}
