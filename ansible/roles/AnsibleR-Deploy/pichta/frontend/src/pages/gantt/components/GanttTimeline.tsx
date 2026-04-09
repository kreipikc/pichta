import React from "react";
import { GanttHeader } from "./GanttHeader";
import { TimelineBar } from "./TimelineBar";
import type { GanttRow as GanttRowType } from "@/hooks/useGraphGanttSkills";
import "./gantt-scrollbar.css";

type Props = {
  gantt: ReturnType<typeof import("./useGanttLayout").useGanttLayout>;

  rows: GanttRowType[];
  zebraEven: string;
  zebraOdd: string;
  gridLine: string;

  // панорамирование
  offsetPx: number;
  handleWheelViewport: (e: React.WheelEvent) => void;
  handleMouseDownViewport: (e: React.MouseEvent) => void;
  dragStateRef: React.MutableRefObject<{
    isDown: boolean;
    startClientX: number;
    startOffsetPx: number;
  }>;

  // размеры
  fullTimelineWidthStyle: string;

  // нижний скроллбар
  bottomScrollRef: React.MutableRefObject<HTMLDivElement | null>;
  handleBottomScroll: () => void;
  bottomScrollInnerWidth: string;
};

export function GanttTimeline({
  gantt,
  rows,
  zebraEven,
  zebraOdd,
  gridLine,

  offsetPx,
  handleWheelViewport,
  handleMouseDownViewport,
  dragStateRef,

  fullTimelineWidthStyle,

  bottomScrollRef,
  handleBottomScroll,
  bottomScrollInnerWidth,
}: Props) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: 240,
      }}
    >
      {/* Основная область таймлайна */}
      <div
        ref={gantt.timelineRef}
        style={{
          position: "relative",
          flex: "1 1 auto",
          overflow: "hidden",
          background: gantt.headerBg,
          cursor: dragStateRef.current.isDown ? "grabbing" : "grab",
        }}
        onWheel={handleWheelViewport}
        onMouseDown={handleMouseDownViewport}
      >
        {/* Шапка шкалы времени (месяцы / недели) */}
        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 5,
            background: gantt.headerBg,
            borderBottom: `1px solid ${gridLine}`,
          }}
        >
          <div
            style={{
              width: fullTimelineWidthStyle,
              transform: `translateX(${offsetPx}px)`,
              willChange: "transform",
            }}
          >
            {/* сам header с месяцами и неделями */}
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
        </div>

        {/* Тело строк с барами */}
        <div
          style={{
            position: "relative",
            width: fullTimelineWidthStyle,
            transform: `translateX(${offsetPx}px)`,
            willChange: "transform",
          }}
        >
          {rows.map((row, idx) => {
            const rowSkillId: number | null =
              (row as any).skillId ??
              (row as any).raw?.skill_id ??
              null;

            return (
              <div
                key={`rowline-${(row as any).id ?? idx}`}
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

      {/* Нижний мини-скроллбар */}
      <div
        ref={bottomScrollRef}
        onScroll={handleBottomScroll}
        className="gantt-bottom-scroll"
        style={{
          flex: "0 0 auto",
          height: 20,
          overflowX: "scroll",
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
    </div>
  );
}
