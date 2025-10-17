export type GraphSkillStat = {
  count: number;
  user_proficiency: number;
  percent: number;
};

export type GraphCategory = GraphSkillStat & Record<string, GraphSkillStat>;

export type GraphResponseI = Record<string, GraphCategory>;


export type GraphGanttItem = {
  id?: number;
  name?: string;
  skill?: { id?: number; name?: string };
  skill_id?: number;
  // даты могут называться по-разному
  start_date?: string;
  end_date?: string;
  start?: string;
  end?: string;
  // мета
  proficiency?: number;
  priority?: number;
  status?: "process" | "complete" | "inactive" | "gray_zone" | string;
  // бэкенд может прислать что-то ещё — оставим как any
  [k: string]: any;
};

export type GraphGanttGray = { name: string; count: number };

export interface GraphGanttResponseI {
  process: GraphGanttItem[];
  inactive: GraphGanttItem[];
  complete: GraphGanttItem[];
  gray_zone: GraphGanttGray[];
}