import { useCallback, useEffect, useMemo, useState } from "react";
import type { GanttRow } from "@/hooks/useGraphGanttSkills";

function keyFor(userId: number, profId: number) {
  return `gantt:order:${userId}:${profId}`;
}

export function useLocalPriority(userId: number, profId: number, rows: GanttRow[]) {
  const [order, setOrder] = useState<number[]>([]); // массив skillId|id

  // skill id для сортировки (fallback на row.id)
  const idOf = (r: GanttRow) => r.skillId ?? r.id;

  useEffect(() => {
    try {
      const raw = localStorage.getItem(keyFor(userId, profId));
      if (raw) setOrder(JSON.parse(raw));
    } catch {}
  }, [userId, profId]);

  const orderedRows = useMemo(() => {
    if (!order.length) return rows;
    const orderMap = new Map(order.map((id, i) => [id, i]));
    return [...rows].sort((a, b) => {
      const ia = orderMap.get(idOf(a));
      const ib = orderMap.get(idOf(b));
      if (ia == null && ib == null) return 0;
      if (ia == null) return 1;
      if (ib == null) return -1;
      return ia - ib;
    });
  }, [rows, order]);

  const persist = (arr: number[]) => {
    setOrder(arr);
    try {
      localStorage.setItem(keyFor(userId, profId), JSON.stringify(arr));
    } catch {}
  };

  const move = useCallback((dragId: number, overId: number) => {
    const list = order.length ? [...order] : rows.map(idOf);
    const from = list.indexOf(dragId);
    const to = list.indexOf(overId);
    if (from < 0 || to < 0 || from === to) return;
    const item = list.splice(from, 1)[0];
    list.splice(to, 0, item);
    persist(list);
  }, [order, rows]);

  const ensureAllRows = useCallback(() => {
    const base = rows.map(idOf);
    const withNew = [...new Set([...(order.length ? order : base), ...base])];
    if (withNew.length !== order.length) persist(withNew);
  }, [rows, order]);

  useEffect(() => {
    ensureAllRows();
  }, [ensureAllRows]);

  return { orderedRows, move };
}
