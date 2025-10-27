import { useState, useEffect, useCallback, useRef } from "react";
import dayjs from "dayjs";
import { useMantineTheme, useMantineColorScheme } from "@mantine/core";

import { useAppSelector } from "@/hooks/useAppSelector";

import {
  useGraphGanttSkills,
  type TypeFilter,
  type GanttRow,
} from "@/hooks/useGraphGanttSkills";

import { useGetAllProfessionQuery } from "@/app/redux/api/profession.api";

import { useLocalPriority } from "@/pages/gantt/components/hooks/useLocalPriority";
import { useGanttLayout } from "@/pages/gantt/components/useGanttLayout";

// без next/router на проде в vite
function getRouteProfIdSafe(): number {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { useRouter } = require("next/router");
    const r = useRouter();
    return Number(r.query.prof_id ?? r.query.id) || 0;
  } catch {
    return 0;
  }
}

export function useGanttController() {
  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === "dark";

  // ======= текущий пользователь =======
  const user = useAppSelector((s) => s.user.currentUser);
  const userId = user?.id ?? 0;

  // ======= профессия =======
  const profIdFromStore =
    (useAppSelector as any)?.((s: any) => s?.profession?.currentId) ?? 0;
  const profIdInitial = Number(profIdFromStore || getRouteProfIdSafe()) || 0;

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

  // если профа не выбрана — берём первую из списка
  useEffect(() => {
    if (!selectedProfId && profOptions.length) {
      const first = Number(profOptions[0].value);
      if (first) setSelectedProfId(first);
    }
  }, [profOptions, selectedProfId]);

  // ======= фильтры =======
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [sortMode, setSortMode] = useState<"type" | "none">("type");

  // ======= данные диаграммы для выбранной профессии =======
  const {
    rows: apiRows,
    isLoading,
    refetch,
  } = useGraphGanttSkills({
    profId: selectedProfId,
    userId,
    typeFilter,
    sortMode,
  });

  // ======= локальный драг-н-дроп приоритета слева =======
  const { orderedRows, move } = useLocalPriority(
    userId,
    selectedProfId,
    apiRows ?? []
  );

  // обновление данных при смене профы/фокуса
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

  // периодически дёргаем список профессий
  useEffect(() => {
    refetchProf();
  }, [refetchProf]);

  // ======= расчёт таймлайна (даты, пиксели, буфер ±365д) =======
  // useGanttLayout:
  //  - берёт min/max дат задач,
  //  - расширяет их на год влево/вправо => viewStart/viewEnd,
  //  - строит массив gantt.dates (каждый день этого расширенного диапазона),
  //  - считает DAY_PX, timelineWidth, taskSpanPx, offsetBasePx и т.д.
  const gantt = useGanttLayout(orderedRows);

  // ======= визуальные цвета =======
  const textDimmed = isDark ? theme.colors.dark[2] : theme.colors.gray[6];
  const zebraEven = isDark ? theme.colors.dark[6] : theme.colors.gray[0];
  const zebraOdd = "transparent";
  const gridLine = isDark ? theme.colors.dark[4] : theme.colors.gray[3];

  // --------------------------------------------------------------------
  // Горизонтальный скролл (верхняя часть таймлайна)
  // --------------------------------------------------------------------

  // текущее смещение translateX(...) в пикселях
  const [offsetPx, setOffsetPx] = useState<number>(0);

  // Полная ширина шкалы времени С БУФЕРОМ ±365д (то, что реально можно скроллить)
  const fullTimelinePx = gantt.dates.length * gantt.DAY_PX;

  // чтобы не перескакивать автофокусом после ручного скролла
  const hasInteractedRef = useRef(false);

  // чтобы автофокус сработал один раз (и при смене профессии перезапускаем)
  const didAutoPosRef = useRef(false);

  /**
   * clampOffset(nextOffset)
   *
   * Ограничивает offsetPx, чтобы пользователь не мог уехать
   * дальше, чем рассчитанный нами расширенный период (буфер ±365д).
   *
   * Левая граница => maxOffsetPx = 0
   * Правая граница => minOffsetPx = -(fullTimelinePx - viewportW)
   */
  const clampOffset = useCallback(
    (nextOffset: number) => {
      // ширина видимой области таймлайна
      const viewportW =
        gantt.timelineWidth && gantt.timelineWidth > 0
          ? gantt.timelineWidth
          : typeof window !== "undefined"
          ? window.innerWidth || 0
          : 0;

      // Если шкала короче видимой области — скролла нет вообще
      if (fullTimelinePx <= viewportW) {
        return 0;
      }

      // правая граница (самый конец вправо)
      const minOffsetPx = -(fullTimelinePx - viewportW);
      // левая граница (самый ранний день буфера прижат к левому краю)
      const maxOffsetPx = 0;

      if (nextOffset < minOffsetPx) return minOffsetPx;
      if (nextOffset > maxOffsetPx) return maxOffsetPx;
      return nextOffset;
    },
    [gantt.timelineWidth, fullTimelinePx]
  );

  /**
   * calcInitialOffsetCenterToday(viewportW)
   *
   * Нам нужно стартово показать "сегодня" примерно посередине экрана.
   *
   * Идея:
   *   - берём самую левую дату шкалы (gantt.dates[0]) — это уже учтённый буфер.
   *   - считаем, сколько дней от неё до сегодня.
   *   - переводим это в пиксели => позиция "сегодня" относительно левого края всей шкалы.
   *   - сдвигаем так, чтобы эта точка оказалась по центру viewport.
   *
   * То есть:
   *   todayPxFromStart = (today - ganttStart) * DAY_PX
   *   desiredOffset    = viewportW/2 - todayPxFromStart
   *
   * Если "сегодня" раньше шкалы или позже шкалы, clampOffset просто прижмёт к краям.
   *
   * Если почему-то нет дат, fallback — просто центр всей шкалы.
   */
  const calcInitialOffsetCenterToday = useCallback(
    (viewportW: number) => {
      const ganttStart = gantt.dates[0];
      if (!ganttStart) {
        // fallback: центрируем весь таймлайн по экрану
        const fullW = fullTimelinePx;
        return viewportW / 2 - fullW / 2;
      }

      const today = dayjs();
      const diffDays = today.diff(ganttStart, "day"); // может быть <0 или >длины
      const todayPxFromStart = diffDays * gantt.DAY_PX;

      // хотим, чтобы today оказался в центре viewport
      const desiredOffset = viewportW / 2 - todayPxFromStart;
      return desiredOffset;
    },
    [gantt.dates, gantt.DAY_PX, fullTimelinePx]
  );

  /**
   * (A) Авто-позиция камеры при первом появлении (и при смене профессии):
   *     — ставим "сегодня" в центр видимой области.
   *     — делаем это ОДИН раз, когда уже известна ширина контейнера,
   *       и пока пользователь сам не крутил.
   *
   * Это эквивалентно мысли "берём сегодня ± год, и по умолчанию
   * показываем середину этого диапазона", потому что середина
   * такого диапазона — это и есть сегодня.
   */
  useEffect(() => {
    if (hasInteractedRef.current) return;
    if (didAutoPosRef.current) return;

    // ждём валидную ширину контейнера (нужна для корректного центрирования)
    const viewportW =
      gantt.timelineWidth && gantt.timelineWidth > 0
        ? gantt.timelineWidth
        : typeof window !== "undefined"
        ? window.innerWidth || 0
        : 0;

    if (!viewportW) return;

    const desired = calcInitialOffsetCenterToday(viewportW);
    const clamped = clampOffset(desired);

    setOffsetPx((prev) => {
      if (Math.abs(prev - clamped) < 1) return prev;
      return clamped;
    });

    didAutoPosRef.current = true;
  }, [
    gantt.timelineWidth,
    calcInitialOffsetCenterToday,
    clampOffset,
  ]);

  /**
   * При смене профессии даём автофокусу право сработать заново,
   * как будто открыли новый экран.
   */
  useEffect(() => {
    didAutoPosRef.current = false;
    hasInteractedRef.current = false;
  }, [selectedProfId]);

  /**
   * (B) Если потом изменилась ширина контейнера
   * или полная длина шкалы — мы не прыгаем по-новой,
   * а просто поджимаем текущий offsetPx в допустимые рамки.
   */
  useEffect(() => {
    setOffsetPx((prev) => clampOffset(prev));
  }, [gantt.timelineWidth, fullTimelinePx, clampOffset]);

  // drag state для панорамирования мышью
  const dragStateRef = useRef<{
    isDown: boolean;
    startClientX: number;
    startOffsetPx: number;
  }>({
    isDown: false,
    startClientX: 0,
    startOffsetPx: 0,
  });

  // колесо мыши / трекпад => горизонтальный пан
  // ВАЖНО: без preventDefault, чтобы не ловить warning про passive listener
  const handleWheelViewport = useCallback(
    (e: React.WheelEvent) => {
      hasInteractedRef.current = true;

      // трекпад часто даёт горизонталь в deltaY, поэтому берём большую компоненту
      const delta =
        Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;

      setOffsetPx((prev) => clampOffset(prev - delta));
    },
    [clampOffset]
  );

  // drag ЛКМ по таймлайну => пан
  const handleMouseDownViewport = useCallback(
    (e: React.MouseEvent) => {
      hasInteractedRef.current = true;

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
  // Нижняя мини-полоска прокрутки (overview только реального диапазона задач)
  // --------------------------------------------------------------------

  const bottomScrollRef = useRef<HTMLDivElement | null>(null);

  /**
   * Нижний скролл крутят → обновляем offsetPx
   *
   * Формула:
   *   scrollLeft = X  → offsetPx = -(offsetBasePx + X)
   *
   * Мини-полоска отражает только реальный спан задач без буфера.
   * Потом offset прогоняем через clampOffset, так что общее ограничение
   * всё равно соблюдается.
   */
  const handleBottomScroll = useCallback(() => {
    hasInteractedRef.current = true;

    const el = bottomScrollRef.current;
    if (!el) return;

    const sl = el.scrollLeft;
    const rawNext = -(gantt.offsetBasePx + sl);

    setOffsetPx((prev) => {
      const clamped = clampOffset(rawNext);
      if (clamped !== prev) return clamped;
      return prev;
    });
  }, [gantt.offsetBasePx, clampOffset]);

  /**
   * offsetPx меняется сверху (колесо/drag) → синхронизируем scrollLeft мини-полоски.
   *
   * Мини-полоска не может ходить в буфер ±365д (там просто нет полосы),
   * поэтому если мы визуально вышли в буфер, scrollLeft прижмётся к 0 или maxScroll.
   */
  useEffect(() => {
    const el = bottomScrollRef.current;
    if (!el) return;

    // хотим scrollLeft = -offsetPx - offsetBasePx
    const desiredScrollLeft = -offsetPx - gantt.offsetBasePx;

    // ширина видимой области по факту
    const viewportW =
      gantt.timelineWidth && gantt.timelineWidth > 0
        ? gantt.timelineWidth
        : typeof window !== "undefined"
        ? window.innerWidth || 0
        : 0;

    // максимально возможный скролл мини-полоски
    const maxScroll = Math.max(0, gantt.taskSpanPx - viewportW);

    const clamped = Math.max(0, Math.min(desiredScrollLeft, maxScroll));

    if (Math.abs(el.scrollLeft - clamped) > 1) {
      el.scrollLeft = clamped;
    }
  }, [offsetPx, gantt.offsetBasePx, gantt.taskSpanPx, gantt.timelineWidth]);

  // ширина внутренней планки мини-карты = только реальный диапазон задач
  const bottomScrollInnerWidth = `${gantt.taskSpanPx}px`;

  // --------------------------------------------------------------------
  // Вспомогательные штуки для рендера
  // --------------------------------------------------------------------

  const rowKeyOf = useCallback(
    (row: GanttRow, fallback: number) =>
      ((row as any).skillId ??
        (row as any).id ??
        fallback) as number,
    []
  );

  const fmtRu = useCallback((d: Date) => d.toLocaleDateString("ru-RU"), []);

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
      bg: isDark ? theme.colors.yellow[9] : theme.colors.yellow[2],
      br: isDark ? theme.colors.yellow[6] : theme.colors.yellow[4],
    },
  } as const;

  // ширина всей верхней шкалы (буфер ±365д)
  const fullTimelineWidthStyle = `${fullTimelinePx}px`;

  return {
    // user / profession
    userId,
    isProfLoading,
    selectedProfId,
    setSelectedProfId,
    profOptions,

    // filters
    typeFilter,
    setTypeFilter,
    sortMode,
    setSortMode,

    // rows
    orderedRows,
    move,

    // loading / reload
    isLoading,
    refetch,
    refetchProf,

    // layout
    gantt,

    // visuals
    textDimmed,
    zebraEven,
    zebraOdd,
    gridLine,
    legendColors,
    fmtRu,
    rowKeyOf,

    // main timeline scroll / pan
    offsetPx,
    setOffsetPx,
    clampOffset,
    handleWheelViewport,
    handleMouseDownViewport,
    dragStateRef,

    // sizes / widths
    fullTimelineWidthStyle,

    // bottom mini-scroll
    bottomScrollRef,
    handleBottomScroll,
    bottomScrollInnerWidth,
  };
}
