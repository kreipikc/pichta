import { useState, useRef, useEffect, useCallback } from "react";
import { Tooltip } from "@mantine/core";
import dayjs from "dayjs";
import { diffDaysInclusive } from "./useGanttLayout";
import type { GanttRow as GanttRowType } from "@/hooks/useGraphGanttSkills";
import { useUpdateSkillMutation } from "@/app/redux/api/skill.api";
import { useAppSelector } from "@/hooks/useAppSelector";

type Props = {
  item: GanttRowType;
  rowIndex: number;
  gantt: ReturnType<typeof import("./useGanttLayout").useGanttLayout>;
  zebraEven: string;
  zebraOdd: string;
  /** если true — прячем вертикальные разделители по дням в этой строке (оверлей) */
  hideDaySplits?: boolean;
};

// локальная clamp, чтобы не тянуть из useGanttLayout
function clamp(v: number, min: number, max: number) {
  if (v < min) return min;
  if (v > max) return max;
  return v;
}

export function GanttRow({
  item: t,
  rowIndex,
  gantt,
  zebraEven,
  zebraOdd,
  hideDaySplits,
}: Props) {
  // позиция и размеры бара (с учётом текущих дат)
  const left = gantt.leftOffsetPx(t.start);
  const width = gantt.widthPx(t.start, t.end);

  // граница видимой области
  const maxLeft = gantt.viewDays * gantt.DAY_PX;
  const clippedLeft = clamp(left, 0, maxLeft);
  const rightEdge = left + width;
  const clippedRight = clamp(rightEdge, 0, maxLeft);
  const clippedWidth = Math.max(0, clippedRight - clippedLeft);

  // локальный drag state
  const [dragging, setDragging] = useState(false);
  const [shiftDays, setShiftDays] = useState(0);
  const drag = useRef<{ x: number; start: Date; end: Date }>({
    x: 0,
    start: t.start,
    end: t.end,
  });

  const [updateSkill] = useUpdateSkillMutation();
  const userId = useAppSelector((s) => s.user.currentUser?.id);

  useEffect(() => {
    // если апдейтнулись пропсы — перезапомним
    drag.current.start = t.start;
    drag.current.end = t.end;
    setShiftDays(0);
  }, [t.start, t.end]);

  // цвета бара
  const isDark = gantt.isDark;
  const theme = gantt.theme;
  const color =
    t.type === "process"
      ? {
          bg: isDark ? theme.colors.blue[9] : theme.colors.blue[2],
          br: isDark ? theme.colors.blue[6] : theme.colors.blue[3],
        }
      : t.type === "complete"
      ? {
          bg: isDark ? theme.colors.teal[9] : theme.colors.teal[2],
          br: isDark ? theme.colors.teal[6] : theme.colors.teal[3],
        }
      : {
          bg: isDark ? theme.colors.gray[8] : theme.colors.gray[2],
          br: isDark ? theme.colors.gray[6] : theme.colors.gray[4],
        };

  // тултип контент
  const tooltip = (
    <div style={{ padding: 0 }}>
      <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>
        {t.title}
      </div>
      <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 6 }}>
        {dayjs(t.start).format("DD.MM.YYYY")} →{" "}
        {dayjs(t.end).format("DD.MM.YYYY")} •{" "}
        {diffDaysInclusive(
          dayjs(t.start).startOf("day"),
          dayjs(t.end).endOf("day")
        )}{" "}
        дн.
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
      <div style={{ fontSize: 11, opacity: 0.6, marginTop: 6 }}>
        Потяните полосу, чтобы сдвинуть сроки
      </div>
    </div>
  );

  const onBarDown = useCallback(
    (e: React.MouseEvent) => {
      if (!t.drawBar) return;
      e.preventDefault();
      e.stopPropagation();
      setDragging(true);
      drag.current.x = e.clientX;
      drag.current.start = t.start;
      drag.current.end = t.end;

      const onMove = (ev: MouseEvent) => {
        const dx = ev.clientX - drag.current.x;
        const dd = Math.round(dx / gantt.DAY_PX);
        setShiftDays(dd);
      };

      const onUp = async () => {
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
        setDragging(false);

        if (shiftDays !== 0) {
          const nextStart = dayjs(drag.current.start).add(shiftDays, "day");
          const nextEnd = dayjs(drag.current.end).add(shiftDays, "day");
          try {
            const skillId =
              (t as any).skillId ?? (t as any).raw?.skill_id ?? t.id;
            if (userId && skillId) {
              await updateSkill({
                user_id: Number(userId),
                skill_id: Number(skillId),
                body: {
                  start_date: nextStart.toISOString(),
                  end_date: nextEnd.toISOString(),
                } as any,
              }).unwrap();
            }
          } catch {
            // можно добавить уведомление об ошибке
          }
        }
        setShiftDays(0);
      };

      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    },
    [gantt.DAY_PX, shiftDays, t, updateSkill, userId]
  );

  return (
    <div
      style={{
        position: "relative",
        height: gantt.ROW_HEIGHT,
        borderBottom: `1px solid ${
          gantt.isDark ? gantt.theme.colors.dark[5] : gantt.theme.colors.gray[2]
        }`,
        background: rowIndex % 2 === 0 ? zebraEven : zebraOdd,
        zIndex: 1,
        userSelect: "none",
      }}
    >
      {/* оверлей для скрытия дневных линий, если нужно */}
      {hideDaySplits && (
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background: rowIndex % 2 === 0 ? zebraEven : "transparent",
            zIndex: 2,
            pointerEvents: "none",
          }}
        />
      )}

      {/* сам бар */}
      {clippedWidth > 0 && t.drawBar && (
        <Tooltip
          withinPortal
          withArrow
          multiline
          openDelay={120}
          label={tooltip}
          disabled={dragging}
        >
          <div
            role="button"
            tabIndex={0}
            onMouseDown={onBarDown}
            onClick={(e) => {
              if (!dragging) {
                e.stopPropagation();
                gantt.modal.openModal(t);
              }
            }}
            onKeyDown={(e) => {
              if (!dragging && (e.key === "Enter" || e.key === " ")) {
                e.preventDefault();
                gantt.modal.openModal(t);
              }
            }}
            style={{
              position: "absolute",
              left: clippedLeft + shiftDays * gantt.DAY_PX,
              top: (gantt.ROW_HEIGHT - 20) / 2,
              height: 20,
              width: clippedWidth,
              borderRadius: 10,
              background: color.bg,
              outline: `1px solid ${color.br}`,
              boxShadow: isDark
                ? "inset 0 -1px 0 rgba(255,255,255,0.04)"
                : "inset 0 -1px 0 rgba(0,0,0,0.06)",
              cursor: "grab",
              zIndex: 3,
              userSelect: "none",
              transition: dragging ? "none" : "transform 120ms ease",
            }}
            aria-label={`${t.title}: c ${dayjs(t.start).format(
              "DD.MM.YYYY"
            )} по ${dayjs(t.end).format("DD.MM.YYYY")}`}
            title=""
          />
        </Tooltip>
      )}
    </div>
  );
}
