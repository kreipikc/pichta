import { Tooltip } from "@mantine/core";
import dayjs from "dayjs";
import { clamp, diffDaysInclusive } from "./useGanttLayout";
import type { NormalizedSkill } from "./useGanttLayout";

type Props = {
  item: NormalizedSkill;
  rowIndex: number;
  gantt: ReturnType<typeof import("./useGanttLayout").useGanttLayout>;
  zebraEven: string;
  zebraOdd: string;
  /** если true — прячем вертикальные разделители по дням в этой строке */
  hideDaySplits?: boolean;
};

export function GanttRow({ item: t, rowIndex, gantt, zebraEven, zebraOdd, hideDaySplits }: Props) {
  const left = gantt.leftOffsetPx(t.start);
  const width = gantt.widthPx(t.start, t.end);

  const maxLeft = gantt.viewDays * gantt.DAY_PX;
  const clippedLeft = clamp(left, 0, maxLeft);
  const rightEdge = left + width;
  const clippedRight = clamp(rightEdge, 0, maxLeft);
  const clippedWidth = Math.max(0, clippedRight - clippedLeft);

  const tooltip = (
    <div style={{ padding: 0 }}>
      <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>{t.title}</div>
      <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 6 }}>
        {dayjs(t.start).format("DD.MM.YYYY")} → {dayjs(t.end).format("DD.MM.YYYY")} •{" "}
        {diffDaysInclusive(dayjs(t.start).startOf("day"), dayjs(t.end).endOf("day"))} дн.
      </div>
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        {typeof t.proficiency === "number" && (
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
            {t.proficiency}%
          </span>
        )}
        {typeof t.priority === "number" && (
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
            P{t.priority}
          </span>
        )}
      </div>
      <div style={{ fontSize: 11, opacity: 0.6, marginTop: 6 }}>Кликните, чтобы открыть подробности</div>
    </div>
  );

  return (
    <div
      style={{
        position: "relative",
        height: gantt.ROW_HEIGHT,
        borderBottom: `1px solid ${gantt.isDark ? gantt.theme.colors.dark[5] : gantt.theme.colors.gray[2]}`,
        background: rowIndex % 2 === 0 ? zebraEven : zebraOdd,
        zIndex: 1,
      }}
    >
      {/* Оверлей: прячем вертикальные линии дней на чётных строках */}
      {hideDaySplits && (
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background: rowIndex % 2 === 0 ? zebraEven : "transparent",
            zIndex: 2,               // выше глобальной сетки
            pointerEvents: "none",   // чтобы не мешать кликам по бару
          }}
        />
      )}

      {clippedWidth > 0 && (
        <Tooltip withinPortal withArrow multiline openDelay={120} label={tooltip}>
          <div
            role="button"
            tabIndex={0}
            onClick={() => gantt.modal.openModal(t)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                gantt.modal.openModal(t);
              }
            }}
            style={{
              position: "absolute",
              left: clippedLeft,
              top: (gantt.ROW_HEIGHT - 20) / 2,
              height: 20,
              width: clippedWidth,
              borderRadius: 10,
              background:
                gantt.theme.colors[gantt.theme.primaryColor]?.[6] ?? gantt.theme.primaryColor,
              outline: `1px solid ${
                gantt.theme.colors[gantt.theme.primaryColor]?.[3] ?? gantt.theme.primaryColor
              }`,
              cursor: "pointer",
              zIndex: 3, // над оверлеем
            }}
            aria-label={`${t.title}: c ${dayjs(t.start).format("DD.MM.YYYY")} по ${dayjs(t.end).format(
              "DD.MM.YYYY"
            )}`}
            title=""
          />
        </Tooltip>
      )}
    </div>
  );
}
