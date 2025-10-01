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

export const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));
export const diffDaysInclusive = (a: dayjs.Dayjs, b: dayjs.Dayjs) => Math.max(1, b.diff(a, "day") + 1);

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

  // левая граница — min(start) или сегодня
  const minStart = useMemo(() => {
    const fallback = dayjs().startOf("day");
    if (!items.length) return fallback;
    let min = dayjs(items[0].start).startOf("day");
    for (const it of items) {
      const s = dayjs(it.start).startOf("day");
      if (s.isBefore(min)) min = s;
    }
    return min;
  }, [items]);

  // === КЛЮЧЕВОЕ: измеряем ШИРИНУ ТОЛЬКО ПРАВОЙ КОЛОНКИ (таймлайна), а не всей таблицы ===
  const timelineRef = useRef<HTMLDivElement | null>(null);
  const [timelineWidth, setTimelineWidth] = useState(0);

  useLayoutEffect(() => {
    const el = timelineRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setTimelineWidth(el.clientWidth));
    ro.observe(el);
    // начальный замер
    setTimelineWidth(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  // сколько дней отображать, чтобы закрыть ПРАВУЮ колонку + покрыть все элементы
  const daysToShow = useMemo(() => {
    const minDaysByWidth = Math.max(7, Math.ceil(timelineWidth / DAY_PX));
    if (!items.length) return minDaysByWidth;

    let maxEnd = dayjs(items[0].end).endOf("day");
    for (const it of items) {
      const e = dayjs(it.end).endOf("day");
      if (e.isAfter(maxEnd)) maxEnd = e;
    }
    const spanTasks = diffDaysInclusive(minStart, maxEnd);
    return Math.max(minDaysByWidth, spanTasks);
  }, [timelineWidth, items, minStart]);

  const viewStart = minStart;
  const viewDays = daysToShow;
  const dates = useMemo(() => buildRange(viewStart, viewDays), [viewStart, viewDays]);

  // заголовки RU
  const monthSpans = useMemo(() => {
    const spans: { key: string; label: string; days: number }[] = [];
    let i = 0;
    while (i < dates.length) {
      const curr = dates[i];
      const label = curr.format("MMM YYYY");
      const key = curr.format("YYYY-MM");
      let j = i + 1;
      while (j < dates.length && dates[j].month() === curr.month() && dates[j].year() === curr.year()) j++;
      spans.push({ key, label, days: j - i });
      i = j;
    }
    return spans;
  }, [dates]);

  const weekSpans = useMemo(() => {
    const spans: { key: string; label: string; days: number }[] = [];
    let i = 0;
    while (i < dates.length) {
      const curr = dates[i];
      const week = curr.isoWeek();
      const label = `Неделя ${week}`;
      const key = `${curr.year()}-W${week}`;
      let j = i + 1;
      while (j < dates.length && dates[j].isoWeek() === week && dates[j].year() === curr.year()) j++;
      spans.push({ key, label, days: j - i });
      i = j;
    }
    return spans;
  }, [dates]);

  const headerBg = isDark ? theme.colors.dark[7] : theme.colors.gray[1];
  const textDimmed = isDark ? theme.colors.gray[4] : theme.colors.gray[7];


  // позиционирование баров
  const leftOffsetPx = (d: Date) => {
    const idx = dayjs(d).startOf("day").diff(viewStart, "day");
    return idx * DAY_PX;
  };
  const widthPx = (start: Date, end: Date) => {
    const s = dayjs(start).startOf("day");
    const e = dayjs(end).endOf("day");
    const days = diffDaysInclusive(s, e);
    return Math.max(DAY_PX, days * DAY_PX);
  };

  // подписи хедера
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

    // ВАЖНО: отдаём ref именно ПРАВОЙ колонке
    timelineRef,

    dates,
    monthSpans,
    weekSpans,
    viewDays,

    headerBg,
    textDimmed,
    segment,
    setSegment,

    leftOffsetPx,
    widthPx,

    modal: { opened, active, openModal, close },
  };
}
