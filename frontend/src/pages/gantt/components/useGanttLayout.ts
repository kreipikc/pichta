import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { useMantineColorScheme, useMantineTheme } from "@mantine/core";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import "dayjs/locale/ru";

dayjs.extend(isoWeek);
dayjs.locale("ru");

export type NormalizedSkill = {
  id: number;
  title: string;
  start: Date;
  end: Date;
  proficiency?: number;
  priority?: number;
  raw?: any;
};

export const diffDaysInclusive = (a: dayjs.Dayjs, b: dayjs.Dayjs) =>
  Math.max(1, b.diff(a, "day") + 1);

export function buildRange(start: dayjs.Dayjs, days: number): dayjs.Dayjs[] {
  const arr: dayjs.Dayjs[] = [];
  for (let i = 0; i < days; i++) arr.push(start.add(i, "day"));
  return arr;
}

export function useGanttLayout(items: NormalizedSkill[]) {
  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === "dark";

  // визуальные константы
  const DAY_PX = 28;
  const ROW_HEIGHT = 36;
  const HEADER_HEIGHT = 72;

  // реальные границы задач (без буфера)
  const { minStartOrig, maxEndOrig } = useMemo(() => {
    if (!items.length) {
      const todayStart = dayjs().startOf("day");
      const todayEnd = dayjs().endOf("day");
      return {
        minStartOrig: todayStart,
        maxEndOrig: todayEnd.add(1, "day"),
      };
    }

    let minS = dayjs(items[0].start).startOf("day");
    let maxE = dayjs(items[0].end).endOf("day");

    for (const it of items) {
      const s = dayjs(it.start).startOf("day");
      const e = dayjs(it.end).endOf("day");
      if (s.isBefore(minS)) minS = s;
      if (e.isAfter(maxE)) maxE = e;
    }

    return { minStartOrig: minS, maxEndOrig: maxE };
  }, [items]);

  // измерение ширины правой части (видимого вьюпорта таймлайна)
  const timelineRef = useRef<HTMLDivElement | null>(null);
  const [timelineWidth, setTimelineWidth] = useState(0);

  const [initialClientWidth] = useState<number>(() =>
    typeof window !== "undefined" ? window.innerWidth : 0
  );
  // грубая оценка ширины правой части (минус левая колонка)
  const estimatedRightWidth = Math.max(0, initialClientWidth - 320 - 32);

  useLayoutEffect(() => {
    const el = timelineRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setTimelineWidth(el.clientWidth));
    ro.observe(el);
    setTimelineWidth(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  // сколько дней нужно минимум, чтобы занять текущую ширину экрана
  const minDaysByWidth = useMemo(() => {
    const widthForCalc = timelineWidth || estimatedRightWidth;
    return Math.max(7, Math.ceil(widthForCalc / DAY_PX));
  }, [timelineWidth, estimatedRightWidth, DAY_PX]);

  // ====== БУФЕР ПО ВРЕМЕНИ ======
  // было 5 лет -> лагало.
  // делаем по 1 году назад и вперёд от минимального/максимального навыка.
  const BUFFER_BEFORE_DAYS = 365;
  const BUFFER_AFTER_DAYS = 365;

  // откуда начинаем всю нашу большую шкалу времени
  const viewStart = useMemo(
    () => minStartOrig.subtract(BUFFER_BEFORE_DAYS, "day").startOf("day"),
    [minStartOrig]
  );

  // полный интервал с буферами
  const rawDaysSpan = useMemo(() => {
    const endWithBuffer = maxEndOrig
      .add(BUFFER_AFTER_DAYS, "day")
      .endOf("day");
    return diffDaysInclusive(viewStart, endWithBuffer);
  }, [viewStart, maxEndOrig]);

  // сколько реально отрисовывать:
  // либо весь (с буфером), либо достаточно для экрана
  const viewDays = useMemo(
    () => Math.max(minDaysByWidth, rawDaysSpan),
    [minDaysByWidth, rawDaysSpan]
  );

  // массив всех дат шкалы
  const dates = useMemo(
    () => buildRange(viewStart, viewDays),
    [viewStart, viewDays]
  );

  // цвета / оформление
  const headerBg = isDark ? theme.colors.dark[6] : theme.white;
  const textDimmed = isDark ? theme.colors.dark[2] : theme.colors.gray[6];

  // месяцы (верхняя строка шкалы)
  const monthSpans = useMemo(() => {
    const spans: { key: string; label: string; days: number }[] = [];
    let i = 0;
    while (i < dates.length) {
      const curr = dates[i];
      const label = curr.format("MMM YYYY");
      const key = curr.format("YYYY-MM");
      let j = i + 1;
      while (
        j < dates.length &&
        dates[j].month() === curr.month() &&
        dates[j].year() === curr.year()
      ) {
        j++;
      }
      spans.push({ key, label, days: j - i });
      i = j;
    }
    return spans;
  }, [dates]);

  // недели (вторая строка шкалы в режиме "недели")
  const weekSpans = useMemo(() => {
    const spans: { key: string; label: string; days: number }[] = [];
    let i = 0;
    while (i < dates.length) {
      const curr = dates[i];
      const week = curr.isoWeek();
      const label = `Неделя ${week}`;
      const key = `${curr.year()}-W${week}`;
      let j = i + 1;
      while (
        j < dates.length &&
        dates[j].isoWeek() === week &&
        dates[j].year() === curr.year()
      ) {
        j++;
      }
      spans.push({ key, label, days: j - i });
      i = j;
    }
    return spans;
  }, [dates]);

  // позиция бара относительно viewStart
  const leftOffsetPx = (start: Date) => {
    const s = dayjs(start).startOf("day");
    const diffDays = s.diff(viewStart, "day");
    const d = Math.max(0, diffDays);
    return d * DAY_PX;
  };

  // ширина бара по датам
  const widthPx = (start: Date, end: Date) => {
    const s = dayjs(start).startOf("day");
    const e = dayjs(end).endOf("day");
    const days = diffDaysInclusive(s, e);
    return Math.max(DAY_PX, days * DAY_PX);
  };

  // сколько пикселей между САМЫМ ранним и САМЫМ поздним навыком (без буфера)
  const taskSpanPx = useMemo(() => {
    const spanDays = diffDaysInclusive(
      minStartOrig.startOf("day"),
      maxEndOrig.endOf("day")
    );
    return spanDays * DAY_PX;
  }, [minStartOrig, maxEndOrig, DAY_PX]);

  // смещение (px) от начала всей шкалы (viewStart) до начала реальных задач
  // нужно чтобы правильно позиционировать offsetPx и нижний скролл
  const offsetBasePx = useMemo(() => {
    return leftOffsetPx(minStartOrig.toDate());
  }, [minStartOrig, leftOffsetPx]);

  // текущий масштаб шкалы (дни / недели / месяцы)
  const [segment, setSegment] = useState<"days" | "weeks" | "months">("weeks");

  // модалка
  const [active, setActive] = useState<any | null>(null);
  const [opened, setOpened] = useState(false);
  const openModal = (item: any) => {
    setActive(item);
    setOpened(true);
  };
  const close = () => setOpened(false);

  return {
    theme,
    isDark,
    DAY_PX,
    ROW_HEIGHT,
    HEADER_HEIGHT,

    timelineRef,
    timelineWidth,

    // шкала
    dates,
    monthSpans,
    weekSpans,
    viewDays,
    viewStart,

    // реальный диапазон задач
    minStartOrig,
    maxEndOrig,
    taskSpanPx,
    offsetBasePx,

    headerBg,
    textDimmed,
    segment,
    setSegment,

    leftOffsetPx,
    widthPx,

    modal: { opened, active, openModal, close },
  };
}
