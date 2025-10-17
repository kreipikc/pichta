import { useMemo } from "react";
import type { GraphGanttResponseI, GraphGanttItem } from "@/shared/types/api/GraphI";
import { useGetGanttByProfessionQuery } from "@/app/redux/api/graph.api";
import type { NormalizedSkill } from "@/pages/gantt/components/useGanttLayout";

export type SkillType = "process" | "gray_zone" | "complete" | "inactive";
export type SortMode = "type" | "none";
export type TypeFilter = "all" | SkillType;

export type GanttRow = NormalizedSkill & {
  type: SkillType;
  drawBar: boolean;      // рисуем ли бар на таймлайне
  skillId?: number;
};

const orderByType: Record<SkillType, number> = {
  process: 0,
  gray_zone: 1,
  complete: 2,
  inactive: 3,
};

function parseDate(v?: string): Date | undefined {
  if (!v) return undefined;
  const d = new Date(v);
  return isNaN(d.getTime()) ? undefined : d;
}

function pickTitle(r: GraphGanttItem, i: number, fallbackPrefix: string) {
  return r?.skill?.name ?? r?.name ?? r?.title ?? r?.skill_name ?? `${fallbackPrefix} #${i + 1}`;
}

function mapBlock(arr: GraphGanttItem[], type: SkillType, prefix: string): GanttRow[] {
  return (arr ?? []).map((r, i) => {
    const startRaw = r.start ?? r.start_date;
    const endRaw   = r.end   ?? r.end_date;

    const start = parseDate(startRaw);
    const end   = parseDate(endRaw);

    const id =
      (r as any).id ??
      (r as any).process_id ??
      r.skill_id ??
      r?.skill?.id ??
      Number(`${orderByType[type]}${i}`); // очень надёжный фолбэк

    const title = pickTitle(r, i, prefix);

    const drawBar = type === "process" || type === "complete";

    // если дат нет — поставим фиктивные, чтобы типы совпали с NormalizedSkill,
    // но bar мы всё равно НЕ рисуем
    const safeStart = start ?? new Date();
    const safeEnd   = end ?? new Date(safeStart.getFullYear(), safeStart.getMonth(), safeStart.getDate() + 7);

    return {
      id,
      title,
      start: safeStart,
      end: safeEnd,
      proficiency: (r as any).proficiency,
      priority: (r as any).priority,
      raw: r,
      type,
      drawBar,
      skillId: r?.skill?.id ?? r?.skill_id,
    };
  });
}

export function useGraphGanttSkills(args: {
  profId: number;
  userId: number;
  sortMode?: SortMode;           // "type" по умолчанию
  typeFilter?: TypeFilter;       // "all" по умолчанию
}) {
  const { profId, userId, sortMode = "type", typeFilter = "all" } = args;

  const query = useGetGanttByProfessionQuery(
    { profId, userId },
    { skip: !(profId && userId) }
  );

  const rows = useMemo<GanttRow[]>(() => {
    const d: GraphGanttResponseI | undefined = query.data;
    if (!d) return [];

    // порядок СТРОГО: process → gray_zone → complete → inactive
    const merged: GanttRow[] = [
      ...mapBlock(d.process, "process", "Навык"),
      ...mapBlock(d.gray_zone as any, "gray_zone", "Серая зона"),
      ...mapBlock(d.complete, "complete", "Навык"),
      ...mapBlock(d.inactive, "inactive", "Навык"),
    ];

    // фильтрация по типу
    const filtered =
      typeFilter === "all" ? merged : merged.filter((r) => r.type === typeFilter);

    // сортировка
    if (sortMode === "type") {
      return [...filtered].sort((a, b) => {
        const oa = orderByType[a.type];
        const ob = orderByType[b.type];
        if (oa !== ob) return oa - ob;
        // внутри типа — по началу
        return a.start.getTime() - b.start.getTime();
      });
    }
    // "none" — оставляем как пришло, но уже после фильтра
    return filtered;
  }, [query.data, sortMode, typeFilter]);

  return {
    ...query,
    rows,
  };
}
