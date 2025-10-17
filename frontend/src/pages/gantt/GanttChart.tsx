// src/pages/.../GanttChart.tsx
import { useEffect, useLayoutEffect, useRef, useState } from "react";
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
  Select,
  useMantineTheme,
  useMantineColorScheme,
} from "@mantine/core";
import { IconRefresh } from "@tabler/icons-react";
import { useAppSelector } from "@/hooks/useAppSelector";
import { useGanttLayout } from "./components/useGanttLayout";
import { GanttHeader } from "./components/GanttHeader";
import { SkillModal } from "./components/SkillModal";

// данные для ганта (нормалайзер под /gantt)
import {
  useGraphGanttSkills,
  type TypeFilter,
  type GanttRow,
} from "@/hooks/useGraphGanttSkills";

// список профессий
import { useGetAllProfessionQuery } from "@/app/redux/api/profession.api";

// (опционально) стартовый profId из роутера
let useRouteProfId: () => number;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { useRouter } = require("next/router");
  useRouteProfId = () => {
    try {
      const r = useRouter();
      return Number(r.query.prof_id ?? r.query.id) || 0;
    } catch {
      return 0;
    }
  };
} catch {
  useRouteProfId = () => 0;
}

export default function GanttChart() {
  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === "dark";

  const user = useAppSelector((s) => s.user.currentUser);
  const userId = user?.id ?? 0;

  // стартовый profId — из стора/роута, дальше управляет селект
  const profIdFromStore =
    (useAppSelector as any)?.((s: any) => s?.profession?.currentId) ?? 0;
  const profIdInitial = Number(profIdFromStore || useRouteProfId()) || 0;

  // === селект профессий ===
  const {
    data: professions,
    isLoading: isProfLoading,
    refetch: refetchProf,
  } = useGetAllProfessionQuery();

  const profOptions =
    (professions ?? []).map((p: any) => ({
      value: String(p.id ?? p.profession_id ?? p.value),
      label: String(p.name ?? p.title ?? p.label ?? "Профессия"),
    })) ?? [];

  const [selectedProfId, setSelectedProfId] = useState<number>(profIdInitial);

  // если profId не задан — берём первую профессию после загрузки
  useEffect(() => {
    if (!selectedProfId && profOptions.length) {
      const first = Number(profOptions[0].value);
      if (first) setSelectedProfId(first);
    }
  }, [profOptions.length, selectedProfId]);

  // фильтр/сортировка
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [sortMode, setSortMode] = useState<"type" | "none">("type");

  // данные для ганта
  const { rows, isLoading, refetch } = useGraphGanttSkills({
    profId: selectedProfId,
    userId,
    typeFilter,
    sortMode,
  });

  // === АВТО-ОБНОВЛЕНИЕ ДАННЫХ ===
  // 1) на маунте и при изменении ключевых аргументов
  useEffect(() => {
    if (userId && selectedProfId) {
      refetch();
    }
  }, [userId, selectedProfId, refetch]);

  // 2) при возврате фокуса/видимости вкладки
  useEffect(() => {
    const revalidate = () => {
      if (userId && selectedProfId) {
        refetch();
      }
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") revalidate();
    };
    window.addEventListener("focus", revalidate);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("focus", revalidate);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [userId, selectedProfId, refetch]);

  // 3) подтягиваем список профессий тоже «свежий»
  useEffect(() => {
    refetchProf();
  }, [refetchProf]);

  // ====== ЛЕЙАУТ ======
  const gantt = useGanttLayout(rows);

  const textDimmed = isDark ? theme.colors.dark[2] : theme.colors.gray[6];
  const zebraEven = isDark ? theme.colors.dark[6] : theme.colors.gray[0];
  const zebraOdd = "transparent";
  const gridLine = isDark ? theme.colors.dark[4] : theme.colors.gray[3];

  // ширина контента таймлайна
  const contentWidthPx = gantt.dates.length * gantt.DAY_PX;
  const hasMeasured = gantt.timelineWidth > 0;
  const showScroll = hasMeasured && contentWidthPx > gantt.timelineWidth + 1;
  const contentWidthStyle = hasMeasured ? `max(100%, ${contentWidthPx}px)` : "100%";

  // синхронизация высоты правого хедера
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

  // hover-лейбл
  const [hovered, setHovered] = useState<GanttRow | null>(null);
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

  // Цвета баров
  const barColors = {
    process: {
      bg: isDark ? theme.colors.blue[9] : theme.colors.blue[2],
      br: isDark ? theme.colors.blue[6] : theme.colors.blue[3],
    },
    complete: {
      bg: isDark ? theme.colors.teal[9] : theme.colors.teal[2],
      br: isDark ? theme.colors.teal[6] : theme.colors.teal[3],
    },
  } as const;

  return (
    <>
      <Card withBorder p="md" radius="lg" style={{ overflow: "hidden" }}>
        {/* Заголовок + контролы */}
        <Group justify="space-between" align="center" mb="md">
          <Group gap="sm" align="center">
            <Title order={3}>Диаграмма Ганта</Title>
            <Badge radius="xl" variant="outline">
              <Text span fw={700} mr={4}>{rows.length}</Text>навыков
            </Badge>
          </Group>

          <Group gap="xs" wrap="nowrap">
            {/* выбор профессии */}
            <Select
              size="xs"
              w={260}
              searchable
              placeholder={isProfLoading ? "Загрузка..." : "Выберите профессию"}
              data={profOptions}
              value={selectedProfId ? String(selectedProfId) : null}
              onChange={(v) => setSelectedProfId(Number(v) || 0)}
              disabled={isProfLoading || !profOptions.length}
              nothingFoundMessage="Профессии не найдены"
            />

            {/* фильтр по типу */}
            <Select
              size="xs"
              value={typeFilter}
              onChange={(v) => setTypeFilter((v as TypeFilter) || "all")}
              data={[
                { label: "Все типы", value: "all" },
                { label: "В процессе", value: "process" },
                { label: "Серая зона", value: "gray_zone" },
                { label: "Завершено", value: "complete" },
                { label: "Неактивно", value: "inactive" },
              ]}
              w={170}
            />

            {/* сортировка по типу */}
            <SegmentedControl
              size="xs"
              value={sortMode}
              onChange={(v) => setSortMode(v as typeof sortMode)}
              data={[
                { label: "По типу", value: "type" },
                { label: "Как пришло", value: "none" },
              ]}
            />

            {/* масштаб времени */}
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
              <ActionIcon
                variant="light"
                onClick={() => {
                  refetch();
                  refetchProf();
                }}
              >
                <IconRefresh size={16} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Group>

        {!userId || !selectedProfId ? (
          <Center mih={160}>
            <Text c="dimmed">Сначала выберите профессию и войдите в систему</Text>
          </Center>
        ) : isLoading ? (
          <Center mih={160}>
            <Loader />
          </Center>
        ) : rows.length === 0 ? (
          <Center mih={160}>
            <Text c="dimmed">Нет навыков для отображения</Text>
          </Center>
        ) : (
          <div
            style={{
              display: "grid",
              // адаптивная левая колонка
              gridTemplateColumns: "clamp(340px, 36vw, 580px) 1fr",
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
              {/* Шапка слева */}
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
                {rows.map((t, i) => (
                  <div
                    key={`${t.id}-${i}`}
                    style={{
                      height: gantt.ROW_HEIGHT,
                      display: "grid",
                      gridTemplateColumns: "minmax(0, 1fr) auto",
                      alignItems: "center",
                      padding: "0 12px",
                      background: i % 2 === 0 ? zebraEven : zebraOdd,
                      borderBottom: `1px solid ${gridLine}`,
                    }}
                  >
                    {/* название + индикатор */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        minWidth: 0,
                      }}
                    >
                      <span
                        title={t.type}
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: 999,
                          marginTop: 1,
                          background:
                            t.type === "process"
                              ? theme.colors.blue[6]
                              : t.type === "complete"
                              ? theme.colors.teal[6]
                              : theme.colors.gray[5],
                          opacity:
                            t.type === "gray_zone" || t.type === "inactive" ? 0.5 : 1,
                          flex: "0 0 auto",
                        }}
                      />
                      <Text
                        fw={500}
                        lineClamp={1}
                        title={t.title}
                        style={{ minWidth: 0 }}
                      >
                        {t.title}
                      </Text>
                    </div>

                    <Text size="sm" c={textDimmed}>
                      {t.type === "gray_zone" || t.type === "inactive"
                        ? "—"
                        : `${fmtRu(t.start)} — ${fmtRu(t.end)}`}
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
              {/* Правый заголовок */}
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
                {rows.map((t, i) => {
                  const leftPx = gantt.leftOffsetPx(t.start);
                  const widthPx = gantt.widthPx(t.start, t.end);

                  const color =
                    t.type === "process"
                      ? barColors.process
                      : t.type === "complete"
                      ? barColors.complete
                      : null;

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
                      {/* Бар рисуем ТОЛЬКО для process и complete */}
                      {t.drawBar && color && (
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
                            border: `1px solid ${color.br}`,
                            background: color.bg,
                            boxShadow: isDark
                              ? "inset 0 -1px 0 rgba(255,255,255,0.04)"
                              : "inset 0 -1px 0 rgba(0,0,0,0.06)",
                            cursor: "pointer",
                            transition: "transform 120ms ease",
                          }}
                        />
                      )}
                    </div>
                  );
                })}

                {/* Ховер-лейбл */}
                {hovered && hovered.drawBar && (
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
                    <div
                      style={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
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
        active={gantt.modal.active as GanttRow | null}
      />
    </>
  );
}
