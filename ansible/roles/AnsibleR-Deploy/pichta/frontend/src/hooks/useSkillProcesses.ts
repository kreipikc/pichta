import { useMemo } from "react";
import { Task } from "gantt-task-react";
import { useGetUserSkillProcessesQuery } from "@/app/redux/api/skill.api";
import type { SkillProcessI } from "@/shared/types/api/SkillI";

// Нежные зелёные тона под светлую тему gantt-task-react
const COLORS = {
  bg: "#12b886",
  prog: "#0ca678",
  sel: "#0ca678",
};

// (Необязательно) лёгкая вариация оттенка по приоритету,
// чтобы визуально отличать более важные задачи.
function colorByPriority(priority: number) {
  // ограничим [1..5], выше — считаем 5
  const p = Math.max(1, Math.min(5, priority || 1));
  // делаем цвет чуть темнее с ростом приоритета
  const darken = (hex: string, factor: number) => {
    const n = parseInt(hex.slice(1), 16);
    const r = Math.max(0, ((n >> 16) & 0xff) - factor);
    const g = Math.max(0, ((n >> 8) & 0xff) - factor);
    const b = Math.max(0, (n & 0xff) - factor);
    return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, "0")}`;
  };
  const step = (5 - p) * 6; // чем выше приоритет, тем темнее (0..24)
  return {
    bg: darken(COLORS.bg, step),
    prog: darken(COLORS.prog, step),
    sel: darken(COLORS.sel, step),
  };
}

export function useSkillProcessesAsTasks(userId?: number) {
  const enabled = typeof userId === "number" && userId > 0;
  const { data, isLoading, isFetching, error, refetch } =
    useGetUserSkillProcessesQuery(userId as number, { skip: !enabled });

  const tasks: Task[] = useMemo(() => {
    if (!data) return [];

    const sorted = [...data].sort((a, b) => {
      if (b.priority !== a.priority) return b.priority - a.priority;
      return new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
    });

    return sorted.map((item, idx): Task => {
      const start = new Date(item.start_date);
      const end = new Date(item.end_date);
      const c = colorByPriority(item.priority ?? 1);

      return {
        id: `${item.id_user}-${item.id_skill}-${idx}`,
        name: item.name,
        start,
        end,
        type: "task",
        progress: Math.max(0, Math.min(100, item.proficiency ?? 0)),
        isDisabled: false, // все приходят как "process" — взаимодействовать можно
        styles: {
          backgroundColor: c.bg,
          progressColor: c.prog,
          backgroundSelectedColor: c.sel,
        },
      };
    });
  }, [data]);

  return { tasks, isLoading, isFetching, error, refetch };
}
