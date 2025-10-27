import { useState, useRef, useEffect, useCallback } from "react";
import { Tooltip as MantineTooltip } from "@mantine/core";
import dayjs from "dayjs";

import { useAppSelector } from "@/hooks/useAppSelector";
import { useGetAllSkillsQuery } from "@/app/redux/api/skill.api";
import { useUpdateSkillMutation } from "@/app/redux/api/skill.api";
import type { GanttRow as GanttRowType } from "@/hooks/useGraphGanttSkills";

export function TimelineBar({
  item,
  gantt,
  maybeSkillId,
}: {
  item: GanttRowType;
  gantt: ReturnType<typeof import("./useGanttLayout").useGanttLayout>;
  maybeSkillId: number | null;
}) {
  const [updateSkill] = useUpdateSkillMutation();
  const userId = useAppSelector((s) => s.user.currentUser?.id);
  const { data: allSkills } = useGetAllSkillsQuery(undefined);

  // локальные дельты дат (drag / resize)
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

  // сбрасываем дельты если пришли новые даты
  useEffect(() => {
    dragRef.current.startOrig = item.start;
    dragRef.current.endOrig = item.end;
    setDeltaStartDays(0);
    setDeltaEndDays(0);
  }, [item.start, item.end]);

  // визуальные даты во время перетаскивания
  const startVisual = dayjs(item.start)
    .add(deltaStartDaysState, "day")
    .toDate();
  const endVisual = dayjs(item.end)
    .add(deltaEndDaysState, "day")
    .toDate();

  const baseLeftPx = gantt.leftOffsetPx(startVisual);
  const baseWidthPx = gantt.widthPx(startVisual, endVisual);

  // раскраска
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
          bg: isDarkLocal
            ? themeLocal.colors.teal[9]
            : themeLocal.colors.teal[2],
          br: isDarkLocal
            ? themeLocal.colors.teal[6]
            : themeLocal.colors.teal[3],
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

              // оптимистично обновляем локально
              (item as any).start = newStart.toDate();
              (item as any).end = newEnd.toDate();
            } catch {
              // сюда можно воткнуть нотификацию об ошибке
            }
          }
        } else if (!wasDrag) {
          // клик, не драг -> открыть модалку
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
        {/* левая ручка */}
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

        {/* тело бара */}
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

        {/* правая ручка */}
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
