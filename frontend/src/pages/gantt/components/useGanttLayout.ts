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
  drawBar?: boolean; // рисуем ли полосу на таймлайне
};

export const diffDaysInclusive = (a: dayjs.Dayjs, b: dayjs.Dayjs) =>
  Math.max(1, b.diff(a, "day") + 1);

export function buildRange(start: dayjs.Dayjs, days: number): dayjs.Dayjs[] {
  const arr: dayjs.Dayjs[] = [];
  for (let i = 0; i < days; i++) arr.push(start.add(i, "day"));
  return arr;
}

/**
 * ISO-недели живут своей жизнью на стыке годов.
 * Нам нужен isoYear отдельно от календарного года.
 */
function getIsoYear(d: dayjs.Dayjs, isoWeekNum: number): number {
  const y = d.year();
  const m = d.month(); // 0=янв ... 11=дек

  // конец декабря может считаться "Неделя 1" следующего года
  if (m === 11 && isoWeekNum === 1) {
    return y + 1;
  }

  // начало января может считаться неделями 52/53 прошлого года
  if (m === 0 && isoWeekNum >= 52) {
    return y - 1;
  }

  return y;
}

/**
 * Главный хук раскладки.
 * ВАЖНО:
 * - границы скролла считаем только по фактическим барам (drawBar === true)
 * - сама шкала дат делается с буфером +/- 365 дней
 */
export function useGanttLayout(
  items: Array<NormalizedSkill & { drawBar?: boolean }>
) {
  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === "dark";

  // геометрия
  const DAY_PX = 28;
  const ROW_HEIGHT = 36;
  const HEADER_HEIGHT = 72;

  // показываемые реально бары
  const visibleItems = useMemo(
    () => (items ?? []).filter((it) => it.drawBar),
    [items]
  );

  // найти min/max по датам из видимых баров
  const { minStartOrig, maxEndOrig } = useMemo(() => {
    if (!visibleItems.length) {
      // фолбэк: "сегодня-завтра", чтобы не было NaN
      const todayStart = dayjs().startOf("day");
      const todayEnd = dayjs().endOf("day").add(1, "day");
      return {
        minStartOrig: todayStart,
        maxEndOrig: todayEnd,
      };
    }

    let minS = dayjs(visibleItems[0].start).startOf("day");
    let maxE = dayjs(visibleItems[0].end).endOf("day");

    for (const it of visibleItems) {
      const s = dayjs(it.start).startOf("day");
      const e = dayjs(it.end).endOf("day");
      if (s.isBefore(minS)) minS = s;
      if (e.isAfter(maxE)) maxE = e;
    }

    return { minStartOrig: minS, maxEndOrig: maxE };
  }, [visibleItems]);

  // ref на правую (таймлайн) колонку и её ширину
  const timelineRef = useRef<HTMLDivElement | null>(null);
  const [timelineWidth, setTimelineWidth] = useState(0);

  // грубая оценка ширины ещё до измерения
  const [initialClientWidth] = useState<number>(() =>
    typeof window !== "undefined" ? window.innerWidth : 0
  );

  // правая колонка примерно = весь вьюпорт - (левая панель ~320px + зазор ~32px)
  const estimatedRightWidth = Math.max(0, initialClientWidth - 320 - 32);

  // реальный замер ширины
  useLayoutEffect(() => {
    const el = timelineRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setTimelineWidth(el.clientWidth));
    ro.observe(el);
    setTimelineWidth(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  // сколько дней влезает по текущей ширине
  const minDaysByWidth = useMemo(() => {
    const widthForCalc = timelineWidth || estimatedRightWidth;
    return Math.max(7, Math.ceil(widthForCalc / DAY_PX));
  }, [timelineWidth, estimatedRightWidth, DAY_PX]);

  // буфер по бокам
  const BUFFER_BEFORE_DAYS = 365;
  const BUFFER_AFTER_DAYS = 365;

  // начало общей шкалы (слева с буфером)
  const viewStart = useMemo(
    () => minStartOrig.subtract(BUFFER_BEFORE_DAYS, "day").startOf("day"),
    [minStartOrig]
  );

  // полная длина шкалы с буфером
  const rawDaysSpan = useMemo(() => {
    const endWithBuffer = maxEndOrig
      .add(BUFFER_AFTER_DAYS, "day")
      .endOf("day");
    return diffDaysInclusive(viewStart, endWithBuffer);
  }, [viewStart, maxEndOrig]);

  // итоговое число дней шкалы
  const viewDays = useMemo(
    () => Math.max(minDaysByWidth, rawDaysSpan),
    [minDaysByWidth, rawDaysSpan]
  );

  // массив всех дат шкалы
  const dates = useMemo(
    () => buildRange(viewStart, viewDays),
    [viewStart, viewDays]
  );

  // цвета
  const headerBg = isDark ? theme.colors.dark[6] : theme.white;
  const textDimmed = isDark ? theme.colors.dark[2] : theme.colors.gray[6];

  // месяцы (верхняя линия)
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

  // недели (нижняя линия под месяцами)
  // ФИКС: ключ теперь основан на isoYear+isoWeek, а не только на weekNum,
  // чтобы не было дубликатов типа "2025-W1"
  const weekSpans = useMemo(() => {
    const spans: { key: string; label: string; days: number }[] = [];
    let i = 0;
    while (i < dates.length) {
      const curr = dates[i];
      const isoW = curr.isoWeek();
      const isoY = getIsoYear(curr, isoW);

      const label = `Неделя ${isoW}`;
      const key = `${isoY}-W${isoW}`;

      let j = i + 1;
      while (j < dates.length) {
        const d = dates[j];
        const wj = d.isoWeek();
        const yj = getIsoYear(d, wj);
        if (wj === isoW && yj === isoY) {
          j++;
        } else {
          break;
        }
      }

      spans.push({ key, label, days: j - i });
      i = j;
    }
    return spans;
  }, [dates]);

  // позиция бара слева относительно viewStart
  const leftOffsetPx = (start: Date) => {
    const s = dayjs(start).startOf("day");
    const diffDays = s.diff(viewStart, "day");
    const d = Math.max(0, diffDays);
    return d * DAY_PX;
  };

  // ширина бара
  const widthPx = (start: Date, end: Date) => {
    const s = dayjs(start).startOf("day");
    const e = dayjs(end).endOf("day");
    const days = diffDaysInclusive(s, e);
    return Math.max(DAY_PX, days * DAY_PX);
  };

  // ширина "реального" диапазона задач (без буферов)
  const taskSpanPx = useMemo(() => {
    const spanDays = diffDaysInclusive(
      minStartOrig.startOf("day"),
      maxEndOrig.endOf("day")
    );
    return spanDays * DAY_PX;
  }, [minStartOrig, maxEndOrig, DAY_PX]);

  // сдвиг (px) от начала шкалы с буфером до момента minStartOrig
  const offsetBasePx = useMemo(() => {
    return leftOffsetPx(minStartOrig.toDate());
  }, [minStartOrig]);

  // текущая гранулярность шкалы
  const [segment, setSegment] = useState<"days" | "weeks" | "months">("weeks");

  // модалка бара
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
    estimatedRightWidth,

    // шкала
    dates,
    monthSpans,
    weekSpans,
    viewDays,
    viewStart,

    // реальные интервалы задач
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
