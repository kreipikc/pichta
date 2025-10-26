import {
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
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
  Tooltip as MantineTooltip,
} from "@mantine/core";
import { IconRefresh } from "@tabler/icons-react";

import { useAppSelector } from "@/hooks/useAppSelector";

import {
  useGraphGanttSkills,
  type TypeFilter,
  type GanttRow,
} from "@/hooks/useGraphGanttSkills";

import { useGetAllProfessionQuery } from "@/app/redux/api/profession.api";

import { useGanttLayout } from "./components/useGanttLayout";
import { GanttHeader } from "./components/GanttHeader";
import { SkillModal } from "./components/SkillModal";

import { useLocalPriority } from "./components/hooks/useLocalPriority";

import dayjs from "dayjs";
import {
  useUpdateSkillMutation,
  useGetAllSkillsQuery,
} from "@/app/redux/api/skill.api";

// стартовый profId (next/router fallback)
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

  // ===== профессия =====
  const profIdFromStore =
    (useAppSelector as any)?.((s: any) => s?.profession?.currentId) ?? 0;
  const profIdInitial = Number(profIdFromStore || useRouteProfId()) || 0;

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

  // если не выбрано — берём первую
  useEffect(() => {
    if (!selectedProfId && profOptions.length) {
      const first = Number(profOptions[0].value);
      if (first) setSelectedProfId(first);
    }
  }, [profOptions, selectedProfId]);

  // ===== фильтры / сорт =====
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [sortMode, setSortMode] = useState<"type" | "none">("type");

  // ===== данные для ганата =====
  const { rows, isLoading, refetch } = useGraphGanttSkills({
    profId: selectedProfId,
    userId,
    typeFilter,
    sortMode,
  });

  // ===== локальный порядок строк слева =====
  const { orderedRows, move } = useLocalPriority(
    userId,
    selectedProfId,
    rows ?? []
  );

  // авто-рефетч при фокусе / смене профы
  useEffect(() => {
    if (userId && selectedProfId) {
      refetch();
    }
  }, [userId, selectedProfId, refetch]);

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

  useEffect(() => {
    refetchProf();
  }, [refetchProf]);

  // ===== лейаут (шкала дат, буферы, модалка и т.п.) =====
  const gantt = useGanttLayout(orderedRows);

  // визуалки
  const textDimmed = isDark ? theme.colors.dark[2] : theme.colors.gray[6];
  const zebraEven = isDark ? theme.colors.dark[6] : theme.colors.gray[0];
  const zebraOdd = "transparent";
  const gridLine = isDark ? theme.colors.dark[4] : theme.colors.gray[3];

  // --------------------------------------------------------------------
  // ПАН / СКРОЛЛ ПО ВРЕМЕНИ
  // --------------------------------------------------------------------

  // offsetPx = на сколько пикселей мы сдвигаем всю «ленту дат» влево/вправо
  const [offsetPx, setOffsetPx] = useState<number>(0);

  // вся шкала = весь буфер от (мин старт - 365д) до (макс конец + 365д)
  const fullTimelinePx = gantt.dates.length * gantt.DAY_PX;
  const fullTimelineWidthStyle = `${fullTimelinePx}px`;

  // ограничитель: не даём уйти дальше годовых буферов
  const clampOffset = useCallback(
    (nextOffset: number) => {
      const viewportW = gantt.timelineWidth;

      // если ширина вьюпорта ещё не измерена — не трогаем
      if (!viewportW || viewportW <= 0) {
        return nextOffset;
      }

      // если вся шкала меньше или равна вьюпорту — смысла двигать нет
      if (fullTimelinePx <= viewportW) {
        return 0;
      }

      // offsetPx мы применяем как translateX(offsetPx)
      // хотим держать translateX в диапазоне [minOffsetPx, maxOffsetPx]
      //
      // maxOffsetPx = 0 (самый левый край ленты соприкасается с левым краем вьюпорта)
      // minOffsetPx = -(fullTimelinePx - viewportW)
      //
      const minOffsetPx = -(fullTimelinePx - viewportW);
      const maxOffsetPx = 0;

      if (nextOffset < minOffsetPx) return minOffsetPx;
      if (nextOffset > maxOffsetPx) return maxOffsetPx;
      return nextOffset;
    },
    [gantt.timelineWidth, fullTimelinePx]
  );

  // важный момент:
  // когда меняется профессия / данные / ширина / диапазон дат —
  // мы должны "перескочить камерой" так, чтобы слева был РЕАЛЬНЫЙ старт задач
  // новой профессии, а не старый offset.
  //
  // gantt.offsetBasePx = сколько пикселей от начала общей шкалы до первой реальной задачи
  // нам нужно, чтобы эта первая задача оказалась у левого края,
  // т.е. translateX = -offsetBasePx
  //
  useEffect(() => {
    const desired = -gantt.offsetBasePx;
    setOffsetPx((prev) => {
      // если prev уже примерно такой же (смены нет) — оставим
      if (Math.abs(prev - desired) < 1) return prev;
      return clampOffset(desired);
    });
    // deps:
    // - selectedProfId: при смене профы перескролливаемся к её задачам
    // - gantt.offsetBasePx: вдруг изменился диапазон задач
    // - gantt.timelineWidth / fullTimelinePx: после ресайза окна/контейнера или пересчёта шкалы
  }, [
    selectedProfId,
    gantt.offsetBasePx,
    gantt.timelineWidth,
    fullTimelinePx,
    clampOffset,
  ]);

  // состояние "я сейчас тяну мышкой вьюпорт"
  const dragStateRef = useRef<{
    isDown: boolean;
    startClientX: number;
    startOffsetPx: number;
  }>({
    isDown: false,
    startClientX: 0,
    startOffsetPx: 0,
  });

  // колёсико мыши => горизонтальный пан
  const handleWheelViewport = useCallback(
    (e: React.WheelEvent) => {
      const delta =
        Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;

      setOffsetPx((prev) => clampOffset(prev - delta));
      e.preventDefault();
    },
    [clampOffset]
  );

  // drag ЛКМ по таймлайну => пан
  const handleMouseDownViewport = useCallback(
    (e: React.MouseEvent) => {
      dragStateRef.current.isDown = true;
      dragStateRef.current.startClientX = e.clientX;
      dragStateRef.current.startOffsetPx = offsetPx;

      const handleMove = (ev: MouseEvent) => {
        if (!dragStateRef.current.isDown) return;
        const dx = ev.clientX - dragStateRef.current.startClientX;
        const rawNext = dragStateRef.current.startOffsetPx + dx;
        setOffsetPx(clampOffset(rawNext));
      };

      const handleUp = () => {
        dragStateRef.current.isDown = false;
        window.removeEventListener("mousemove", handleMove);
        window.removeEventListener("mouseup", handleUp);
      };

      window.addEventListener("mousemove", handleMove);
      window.addEventListener("mouseup", handleUp);
    },
    [offsetPx, clampOffset]
  );

  // --------------------------------------------------------------------
  // НИЖНИЙ СКРОЛЛБАР (миникарта реального диапазона задач)
  // --------------------------------------------------------------------

  // Пояснение:
  //  - taskSpanPx = ширина именно задач (от первой до последней), без годовых буферов
  //  - offsetBasePx = где в большой шкале начинается первая задача
  //
  // Мы хотим, чтобы нижняя полоса прокручивала ИМЕННО задачный интервал.
  // Она нужна только если задачи реально шире вьюпорта.
  //
  const needBottomScroll =
    gantt.timelineWidth > 0 &&
    gantt.taskSpanPx > gantt.timelineWidth + 1;

  const bottomScrollRef = useRef<HTMLDivElement | null>(null);

  // нижний скролл -> меняем offsetPx
  const handleBottomScroll = useCallback(() => {
    const el = bottomScrollRef.current;
    if (!el) return;
    const sl = el.scrollLeft;
    // scrollLeft = X => в основном вьюпорте нужно показать вид,
    // будто мы пролистали X пикселей вправо от начала задач.
    // Основной translateX = -(offsetBasePx + X)
    const rawNext = -(gantt.offsetBasePx + sl);
    setOffsetPx(clampOffset(rawNext));
  }, [gantt.offsetBasePx, clampOffset]);

  // основной offsetPx -> нижний scrollLeft
  useEffect(() => {
    if (!needBottomScroll) return;
    const el = bottomScrollRef.current;
    if (!el) return;

    // offsetPx = -(offsetBasePx + scrollLeft)
    // => scrollLeft = -offsetPx - offsetBasePx
    const desired = -offsetPx - gantt.offsetBasePx;

    // не даём ползунку выйти за реальный диапазон задач
    const maxScroll = Math.max(
      0,
      gantt.taskSpanPx - gantt.timelineWidth
    );
    const clamped = Math.max(0, Math.min(desired, maxScroll));

    if (Math.abs(el.scrollLeft - clamped) > 1) {
      el.scrollLeft = clamped;
    }
  }, [
    offsetPx,
    gantt.offsetBasePx,
    gantt.taskSpanPx,
    gantt.timelineWidth,
    needBottomScroll,
  ]);

  // ширина внутреннего контента нижней полоски:
  // хотим, чтобы если задачи шире вьюпорта -> был горизонтальный скролл,
  // если влезают -> ползунка нет (и сам блок не монтируется).
  const bottomScrollInnerWidth = `${gantt.taskSpanPx}px`;

  // --------------------------------------------------------------------
  // Легенда и цвета
  // --------------------------------------------------------------------
  const legendColors = {
    process: {
      bg: isDark ? theme.colors.blue[9] : theme.colors.blue[2],
      br: isDark ? theme.colors.blue[6] : theme.colors.blue[3],
    },
    complete: {
      bg: isDark ? theme.colors.teal[9] : theme.colors.teal[2],
      br: isDark ? theme.colors.teal[6] : theme.colors.teal[3],
    },
    gray_zone: {
      bg: isDark ? theme.colors.gray[8] : theme.colors.gray[2],
      br: isDark ? theme.colors.gray[6] : theme.colors.gray[4],
    },
    inactive: {
      // жёлтый вместо серого
      bg: isDark ? theme.colors.yellow[9] : theme.colors.yellow[2],
      br: isDark ? theme.colors.yellow[6] : theme.colors.yellow[4],
    },
  } as const;

  const fmtRu = (d: Date) => d.toLocaleDateString("ru-RU");

  // ключ, который и useLocalPriority использует для сортировки
  const rowKeyOf = (row: GanttRow, fallback: number) =>
    ((row as any).skillId ??
      (row as any).id ??
      fallback) as number;

  return (
    <>
      <Card withBorder p="md" radius="lg">
        {/* ===== Верхняя панель с контролами ===== */}
        <Group justify="space-between" align="center" mb="md" wrap="wrap">
          <Group gap="sm" align="center">
            <Title order={3}>Диаграмма Ганта</Title>
            <Badge radius="xl" variant="outline">
              <Text span fw={700} mr={4}>
                {orderedRows.length}
              </Text>
              навыков
            </Badge>
          </Group>

          <Group gap="xs" wrap="nowrap" align="center">
            {/* выбор профессии */}
            <Select
              size="xs"
              w={260}
              searchable
              placeholder={
                isProfLoading ? "Загрузка..." : "Выберите профессию"
              }
              data={profOptions}
              value={selectedProfId ? String(selectedProfId) : null}
              onChange={(v) => setSelectedProfId(Number(v) || 0)}
              disabled={isProfLoading || !profOptions.length}
              nothingFoundMessage="Профессии не найдены"
            />

            {/* фильтр статуса */}
            <Select
              size="xs"
              value={typeFilter}
              onChange={(v) => setTypeFilter((v as TypeFilter) || "all")}
              data={[
                { label: "Все типы", value: "all" },
                { label: "В процессе", value: "process" },
                { label: "Не начаты", value: "gray_zone" },
                { label: "Завершено", value: "complete" },
                { label: "Изначально был", value: "inactive" },
              ]}
              w={170}
            />

            {/* сортировка */}
            <SegmentedControl
              size="xs"
              value={sortMode}
              onChange={(v) => setSortMode(v as typeof sortMode)}
              data={[
                { label: "По типу", value: "type" },
                { label: "Как пришло", value: "none" },
              ]}
            />

            {/* масштаб времени (дни/недели/месяцы) */}
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

            {/* рефреш */}
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

            {/* легенда */}
            <Group gap={6} wrap="nowrap">
              <Badge
                size="xs"
                variant="light"
                pl={6}
                leftSection={
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 2,
                      background: legendColors.process.bg,
                      border: `1px solid ${legendColors.process.br}`,
                    }}
                  />
                }
              >
                В процессе
              </Badge>

              <Badge
                size="xs"
                variant="light"
                pl={6}
                leftSection={
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 2,
                      background: legendColors.complete.bg,
                      border: `1px solid ${legendColors.complete.br}`,
                    }}
                  />
                }
              >
                Завершено
              </Badge>

              <Badge
                size="xs"
                variant="light"
                pl={6}
                leftSection={
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 2,
                      background: legendColors.gray_zone.bg,
                      border: `1px solid ${legendColors.gray_zone.br}`,
                    }}
                  />
                }
              >
                Не начаты
              </Badge>

              <Badge
                size="xs"
                variant="light"
                pl={6}
                leftSection={
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 2,
                      background: legendColors.inactive.bg,
                      border: `1px solid ${legendColors.inactive.br}`,
                    }}
                  />
                }
              >
                Изначально был
              </Badge>
            </Group>
          </Group>
        </Group>

        {/* ===== Контент ===== */}
        {!userId || !selectedProfId ? (
          <Center mih={160}>
            <Text c="dimmed">
              Сначала выберите профессию и войдите в систему
            </Text>
          </Center>
        ) : isLoading ? (
          <Center mih={160}>
            <Loader />
          </Center>
        ) : orderedRows.length === 0 ? (
          <Center mih={160}>
            <Text c="dimmed">Нет навыков для отображения</Text>
          </Center>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "clamp(340px, 36vw, 580px) 1fr",
              minHeight: 240,
              borderRadius: 12,
              border: `1px solid ${gridLine}`,
            }}
          >
            {/* ===== Левая колонка (названия навыков + локальный приоритет) ===== */}
            <div
              style={{
                position: "relative",
                borderRight: `1px solid ${gridLine}`,
              }}
            >
              {/* шапка слева */}
              <div
                style={{
                  position: "sticky",
                  top: 0,
                  zIndex: 2,
                  background: gantt.headerBg,
                  borderBottom: `1px solid ${gridLine}`,
                  minHeight: 72,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Group justify="space-between" px="md" w="100%">
                  <Text fw={600} size="sm" c={textDimmed}>
                    Навык (тяните, чтобы изменить приоритет)
                  </Text>
                  <Text fw={600} size="sm" c={textDimmed}>
                    Период
                  </Text>
                </Group>
              </div>

              {/* строки слева, которые можно перетаскивать */}
              <div>
                {orderedRows.map((row: GanttRow, idx: number) => {
                  const thisKey = rowKeyOf(row, idx);

                  const dotColor =
                    row.type === "process"
                      ? theme.colors.blue[6]
                      : row.type === "complete"
                      ? theme.colors.teal[6]
                      : row.type === "inactive"
                      ? theme.colors.yellow[6]
                      : theme.colors.gray[5];

                  const dotOpacity =
                    row.type === "gray_zone" ? 0.5 : 1;

                  return (
                    <div
                      key={`left-${thisKey}`}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData("text/plain", String(thisKey));
                        e.dataTransfer.effectAllowed = "move";
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = "move";
                      }}
                      onDrop={(e) => {
                        const dragId = Number(
                          e.dataTransfer.getData("text/plain")
                        );
                        move(dragId, thisKey);
                      }}
                      style={{
                        height: gantt.ROW_HEIGHT,
                        display: "grid",
                        gridTemplateColumns: "minmax(0, 1fr) auto",
                        alignItems: "center",
                        padding: "0 12px",
                        background: idx % 2 === 0 ? zebraEven : zebraOdd,
                        borderBottom: `1px solid ${gridLine}`,
                        cursor: "grab",
                        userSelect: "none",
                      }}
                      title="Потяните вверх/вниз, чтобы изменить приоритет локально"
                    >
                      {/* инфо про навык */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          minWidth: 0,
                        }}
                      >
                        <span
                          title={row.type}
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: 999,
                            marginTop: 1,
                            background: dotColor,
                            opacity: dotOpacity,
                            flex: "0 0 auto",
                          }}
                        />
                        <Text
                          fw={500}
                          lineClamp={1}
                          title={row.title}
                          style={{ minWidth: 0 }}
                        >
                          {row.title}
                        </Text>

                        {typeof row.proficiency === "number" && (
                          <Badge
                            size="xs"
                            variant="light"
                            color="teal"
                            title="Прогресс"
                          >
                            {row.proficiency}%
                          </Badge>
                        )}

                        {typeof row.priority === "number" && (
                          <Badge
                            size="xs"
                            variant="outline"
                            color="yellow"
                            title="Приоритет"
                          >
                            P{row.priority}
                          </Badge>
                        )}
                      </div>

                      <Text size="sm" c={textDimmed}>
                        {row.type === "gray_zone" || row.type === "inactive"
                          ? "—"
                          : `${fmtRu(row.start)} — ${fmtRu(row.end)}`}
                      </Text>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ===== Правая колонка (таймлайн + нижний мини-скролл) ===== */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                minHeight: 240,
              }}
            >
              {/* Вьюпорт таймлайна */}
              <div
                ref={gantt.timelineRef}
                style={{
                  position: "relative",
                  flex: "1 1 auto",
                  overflow: "hidden", // сами управляем трансформацией, не native scroll
                  background: gantt.headerBg,
                  cursor: dragStateRef.current.isDown ? "grabbing" : "grab",
                }}
                onWheel={handleWheelViewport}
                onMouseDown={handleMouseDownViewport}
              >
                {/* Канва с барами и шкалой. Мы просто сдвигаем translateX(offsetPx). */}
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    minWidth: fullTimelineWidthStyle,
                    transform: `translateX(${offsetPx}px)`,
                    willChange: "transform",
                  }}
                >
                  {/* Хедер времени (месяцы/недели/дни) */}
                  <div
                    style={{
                      position: "sticky",
                      top: 0,
                      zIndex: 5,
                      minWidth: fullTimelineWidthStyle,
                      background: gantt.headerBg,
                    }}
                  >
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

                  {/* строки с барами */}
                  <div
                    style={{
                      minWidth: fullTimelineWidthStyle,
                      position: "relative",
                    }}
                  >
                    {orderedRows.map((row: GanttRow, idx: number) => {
                      const rowSkillId: number | null =
                        (row as any).skillId ??
                        (row as any).raw?.skill_id ??
                        null;

                      return (
                        <div
                          key={`rowline-${rowKeyOf(row, idx)}`}
                          style={{
                            position: "relative",
                            height: gantt.ROW_HEIGHT,
                            background: idx % 2 === 0 ? zebraEven : zebraOdd,
                            borderBottom: `1px solid ${gridLine}`,
                            userSelect: "none",
                            zIndex: 1,
                            width: "100%",
                          }}
                        >
                          <TimelineBar
                            item={row}
                            gantt={gantt}
                            maybeSkillId={rowSkillId}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Нижний скроллбар (только если задачи реально шире экрана) */}
              {needBottomScroll && (
                <div
                  ref={bottomScrollRef}
                  onScroll={handleBottomScroll}
                  style={{
                    flex: "0 0 auto",
                    height: 12,
                    overflowX: "auto",
                    overflowY: "hidden",
                    background: gantt.headerBg,
                    borderTop: `1px solid ${gridLine}`,
                  }}
                >
                  <div
                    style={{
                      width: bottomScrollInnerWidth,
                      height: 1,
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </Card>

      {/* модалка по клику на бар */}
      <SkillModal
        opened={gantt.modal.opened}
        onClose={gantt.modal.close}
        active={gantt.modal.active as GanttRow | null}
      />
    </>
  );
}

/* ======================================================================
   TimelineBar: интерактивный бар навыка (перетаскивание/ресайз + PUT)
   ====================================================================== */

function TimelineBar({
  item,
  gantt,
  maybeSkillId,
}: {
  item: GanttRow;
  gantt: ReturnType<typeof useGanttLayout>;
  maybeSkillId: number | null;
}) {
  const [updateSkill] = useUpdateSkillMutation();
  const userId = useAppSelector((s) => s.user.currentUser?.id);
  const { data: allSkills } = useGetAllSkillsQuery(undefined);

  // локальные дельты дат
  const [deltaStartDaysState, _setDeltaStartDays] = useState(0);
  const [deltaEndDaysState, _setDeltaEndDays] = useState(0);
  const deltaStartRef = useRef(0);
  const deltaEndRef = useRef(0);

  const setDeltaStartDays = (val: number) => {
    deltaStartRef.current = val;
    _setDeltaStartDays(val);
  };
  const setDeltaEndDays = (val: number) => {
    deltaEndRef.current = val;
    _setDeltaEndDays(val);
  };

  const dragRef = useRef<{
    mode: "move" | "left" | "right" | null;
    startX: number;
    totalDx: number;
    startOrig: Date;
    endOrig: Date;
  }>({
    mode: null,
    startX: 0,
    totalDx: 0,
    startOrig: item.start,
    endOrig: item.end,
  });

  const [dragging, setDragging] = useState(false);

  // сбрасываем дельты если пришли новые даты снаружи
  useEffect(() => {
    dragRef.current.startOrig = item.start;
    dragRef.current.endOrig = item.end;
    setDeltaStartDays(0);
    setDeltaEndDays(0);
  }, [item.start, item.end]);

  // визуальные даты с учётом перетаскивания
  const startVisual = dayjs(item.start)
    .add(deltaStartDaysState, "day")
    .toDate();
  const endVisual = dayjs(item.end)
    .add(deltaEndDaysState, "day")
    .toDate();

  const baseLeftPx = gantt.leftOffsetPx(startVisual);
  const baseWidthPx = gantt.widthPx(startVisual, endVisual);

  // раскраска бара
  const isDarkLocal = gantt.isDark;
  const themeLocal = gantt.theme;
  const color =
    item.type === "process"
      ? {
          bg: isDarkLocal ? themeLocal.colors.blue[9] : themeLocal.colors.blue[2],
          br: isDarkLocal ? themeLocal.colors.blue[6] : themeLocal.colors.blue[3],
        }
      : item.type === "complete"
      ? {
          bg: isDarkLocal ? themeLocal.colors.teal[9] : themeLocal.colors.teal[2],
          br: isDarkLocal ? themeLocal.colors.teal[6] : themeLocal.colors.teal[3],
        }
      : item.type === "inactive"
      ? {
          bg: isDarkLocal
            ? themeLocal.colors.yellow[9]
            : themeLocal.colors.yellow[2],
          br: isDarkLocal
            ? themeLocal.colors.yellow[6]
            : themeLocal.colors.yellow[4],
        }
      : {
          bg: isDarkLocal
            ? themeLocal.colors.gray[8]
            : themeLocal.colors.gray[2],
          br: isDarkLocal
            ? themeLocal.colors.gray[6]
            : themeLocal.colors.gray[4],
        };

  // тултип бара
  const tooltipContent = (
    <div style={{ padding: 0 }}>
      <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>
        {item.title}
      </div>
      <div
        style={{
          fontSize: 12,
          opacity: 0.75,
          marginBottom: 6,
          whiteSpace: "nowrap",
        }}
      >
        {dayjs(startVisual).format("DD.MM.YYYY")} →{" "}
        {dayjs(endVisual).format("DD.MM.YYYY")}
      </div>
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        {typeof item.proficiency === "number" && (
          <span
            style={{
              fontSize: 11,
              padding: "2px 6px",
              borderRadius: 6,
              border: "1px solid currentColor",
              opacity: 0.9,
            }}
            title="Прогресс"
          >
            {item.proficiency}%
          </span>
        )}
        {typeof item.priority === "number" && (
          <span
            style={{
              fontSize: 11,
              padding: "2px 6px",
              borderRadius: 6,
              background: "rgba(255, 200, 0, .15)",
              border: "1px solid rgba(255,200,0,.35)",
            }}
            title="Приоритет"
          >
            P{item.priority}
          </span>
        )}
      </div>
      <div
        style={{
          fontSize: 11,
          opacity: 0.6,
          marginTop: 6,
          whiteSpace: "nowrap",
        }}
      >
        Потяните полосу или края, чтобы изменить сроки
      </div>
    </div>
  );

  // корректный skill_id для PUT
  const getEffectiveSkillId = () => {
    if (maybeSkillId && maybeSkillId > 0) return maybeSkillId;

    const cand1 = (item as any)?.skillId;
    if (cand1 && cand1 > 0) return cand1;

    const cand2 = (item as any)?.raw?.skill_id;
    if (cand2 && cand2 > 0) return cand2;

    if (allSkills && (item as any)?.title) {
      const nm = String((item as any).title).toLowerCase();
      const byName = (allSkills as any[]).find(
        (s) => String(s.name).toLowerCase() === nm
      );
      if (byName?.id && byName.id > 0) return byName.id;
    }
    return null;
  };

  // старт drag / resize
  const startDrag = useCallback(
    (e: React.MouseEvent, mode: "move" | "left" | "right") => {
      if (!item.drawBar) return;
      e.preventDefault();
      e.stopPropagation(); // не даём вьюпорту начать панорамирование

      setDragging(true);

      dragRef.current.mode = mode;
      dragRef.current.startX = e.clientX;
      dragRef.current.totalDx = 0;
      dragRef.current.startOrig = item.start;
      dragRef.current.endOrig = item.end;

      setDeltaStartDays(0);
      setDeltaEndDays(0);

      const onMove = (ev: MouseEvent) => {
        const dx = ev.clientX - dragRef.current.startX;
        dragRef.current.totalDx = dx;
        const dd = Math.round(dx / gantt.DAY_PX);

        if (dragRef.current.mode === "move") {
          setDeltaStartDays(dd);
          setDeltaEndDays(dd);
        } else if (dragRef.current.mode === "left") {
          // не дать сделать длительность <1 дня
          const minStart = dayjs(dragRef.current.endOrig).add(-1, "day");
          const safeDd =
            dd > 0
              ? Math.min(
                  dd,
                  minStart.diff(dayjs(dragRef.current.startOrig), "day")
                )
              : dd;
          setDeltaStartDays(safeDd);
          setDeltaEndDays(0);
        } else if (dragRef.current.mode === "right") {
          const minEnd = dayjs(dragRef.current.startOrig).add(1, "day");
          const safeDd =
            dd < 0
              ? Math.max(
                  dd,
                  minEnd.diff(dayjs(dragRef.current.endOrig), "day")
                )
              : dd;
          setDeltaStartDays(0);
          setDeltaEndDays(safeDd);
        }
      };

      const onUp = async () => {
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);

        const { mode: finalMode, startOrig, endOrig, totalDx } =
          dragRef.current;

        const startShiftDays = deltaStartRef.current;
        const endShiftDays = deltaEndRef.current;

        setDragging(false);

        const newStart =
          finalMode === "move" || finalMode === "left"
            ? dayjs(startOrig).add(startShiftDays, "day")
            : dayjs(startOrig);

        const newEnd =
          finalMode === "move" || finalMode === "right"
            ? dayjs(endOrig).add(endShiftDays, "day")
            : dayjs(endOrig);

        const changedDays =
          finalMode === "move"
            ? startShiftDays !== 0 || endShiftDays !== 0
            : finalMode === "left"
            ? startShiftDays !== 0
            : finalMode === "right"
            ? endShiftDays !== 0
            : false;

        const wasDrag = Math.abs(totalDx) > 3;

        if (wasDrag && changedDays && userId) {
          const effectiveSkillId = getEffectiveSkillId();

          if (effectiveSkillId && effectiveSkillId > 0) {
            try {
              const body: {
                proficiency: number;
                status: string;
                start_date?: string;
                end_date?: string;
              } = {
                proficiency: (item as any).proficiency ?? 0,
                status: (item as any).type ?? "process",
              };

              if (finalMode === "move") {
                body.start_date = newStart.toISOString();
                body.end_date = newEnd.toISOString();
              } else if (finalMode === "left") {
                body.start_date = newStart.toISOString();
              } else if (finalMode === "right") {
                body.end_date = newEnd.toISOString();
              }

              await updateSkill({
                user_id: Number(userId),
                skill_id: Number(effectiveSkillId),
                body,
              }).unwrap();

              // оптимистично обновим локально
              (item as any).start = newStart.toDate();
              (item as any).end = newEnd.toDate();
            } catch {
              // можно воткнуть уведомление
            }
          }
        } else if (!wasDrag) {
          // клик, не драг -> модалка
          gantt.modal.openModal(item);
        }

        setDeltaStartDays(0);
        setDeltaEndDays(0);
        dragRef.current.mode = null;
      };

      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    },
    [gantt.DAY_PX, gantt.modal, item, updateSkill, userId, allSkills, maybeSkillId]
  );

  if (!item.drawBar || baseWidthPx <= 0) {
    return null;
  }

  return (
    <MantineTooltip
      withinPortal
      withArrow
      multiline
      openDelay={120}
      label={tooltipContent}
      disabled={dragging}
    >
      <div
        style={{
          position: "absolute",
          left: baseLeftPx,
          top: 6,
          height: gantt.ROW_HEIGHT - 12,
          width: baseWidthPx,
          borderRadius: 8,
          border: `1px solid ${color.br}`,
          background: color.bg,
          boxShadow: isDarkLocal
            ? "inset 0 -1px 0 rgba(255,255,255,0.04)"
            : "inset 0 -1px 0 rgba(0,0,0,0.06)",
          cursor: "grab",
          userSelect: "none",
          zIndex: 3,
        }}
      >
        {/* левая ручка (resize старта) */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            height: "100%",
            width: 6,
            cursor: "ew-resize",
            borderRight: `1px solid ${color.br}`,
            borderTopLeftRadius: 8,
            borderBottomLeftRadius: 8,
          }}
          onMouseDown={(e) => startDrag(e, "left")}
        />

        {/* тело бара (перемещение всего интервала) */}
        <div
          style={{
            position: "absolute",
            left: 6,
            right: 6,
            top: 0,
            bottom: 0,
            cursor: "grab",
          }}
          onMouseDown={(e) => startDrag(e, "move")}
        />

        {/* правая ручка (resize конца) */}
        <div
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            height: "100%",
            width: 6,
            cursor: "ew-resize",
            borderLeft: `1px solid ${color.br}`,
            borderTopRightRadius: 8,
            borderBottomRightRadius: 8,
          }}
          onMouseDown={(e) => startDrag(e, "right")}
        />
      </div>
    </MantineTooltip>
  );
}
