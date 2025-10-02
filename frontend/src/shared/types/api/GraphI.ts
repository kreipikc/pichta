export type GraphSkillStat = {
  count: number;
  user_proficiency: number;
  percent: number;
};

export type GraphCategory = GraphSkillStat & Record<string, GraphSkillStat>;

export type GraphResponseI = Record<string, GraphCategory>;
