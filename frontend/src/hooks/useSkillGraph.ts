import { useMemo } from 'react';
import type { GraphResponseI } from '@/shared/types/api/GraphI';

export type FGNode = {
  id: string;
  group: 'role' | 'category' | 'skill';
  level: number;
  color?: string;
  count?: number;
  user_proficiency?: number;
  percent?: number;
};

export type FGLink = { source: string; target: string };

const STAT_KEYS = new Set(['count','user_proficiency','percent']);

export function useSkillGraphData(graph?: GraphResponseI, search?: string) {
  return useMemo(() => {
    if (!graph) return { nodes: [], links: [] } as { nodes: FGNode[]; links: FGLink[] };

    const nodes = new Map<string, FGNode>();
    const links: FGLink[] = [];

    const [professionName] = Object.keys(graph);
    const root = graph[professionName];

    // корневой узел (профессия)
    nodes.set(professionName, { id: professionName, group: 'role', level: 0 });

    // категории
    Object.entries(root).forEach(([categoryName, value]) => {
      if (STAT_KEYS.has(categoryName)) return;
      if (!value || typeof value !== 'object') return;

      if (!nodes.has(categoryName)) {
        nodes.set(categoryName, { id: categoryName, group: 'category', level: 1 });
      }
      links.push({ source: professionName, target: categoryName });

      // навыки внутри категории
      Object.entries(value as any).forEach(([skillName, stat]) => {
        if (STAT_KEYS.has(skillName)) return;
        const s = stat as any;
        const mastered = (typeof s?.user_proficiency === 'number' ? s.user_proficiency : 0) > 0;
        if (!nodes.has(skillName)) {
          nodes.set(skillName, {
            id: skillName,
            group: 'skill',
            level: 2,
            count: s?.count,
            user_proficiency: s?.user_proficiency,
            percent: s?.percent,
            color: mastered ? '#12b886' : '#adb5bd',
          });
        }
        links.push({ source: categoryName, target: skillName });
      });
    });

    // поиск
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      const keep = new Set<string>();

      Array.from(nodes.values())
        .filter((n) => n.group === 'skill' && n.id.toLowerCase().includes(q))
        .forEach((n) => keep.add(n.id));

      links.forEach(({ source, target }) => {
        if (keep.has(target)) keep.add(source);
      });

      if (keep.size > 0) keep.add(professionName);

      const filteredNodes = Array.from(nodes.values()).filter((n) => keep.has(n.id));
      const filteredIds = new Set(filteredNodes.map((n) => n.id));
      const filteredLinks = links.filter((l) => filteredIds.has(l.source) && filteredIds.has(l.target));
      return { nodes: filteredNodes, links: filteredLinks };
    }

    return { nodes: Array.from(nodes.values()), links };
  }, [graph, search]);
}
