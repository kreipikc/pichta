// Обновлено: разделил тип для ответа (с name) и для DTO (без name)

export interface UserSkillBaseI {
  id_skill: number;
  id_user: number;
  proficiency: number;
  priority?: number | null;
  start_date?: string | null;
  end_date?: string | null;
  status: string;
}

export interface UserSkillWithNameI extends UserSkillBaseI {
  name: string;
}

// Для POST /skill/add (на бэке ждут массив таких объектов)
export type UserSkillCreateI = UserSkillBaseI;

// Для PATCH /skill/update (тоже массив). Поля частично optional, но id_skill обязателен.
export interface UserSkillUpdateI {
  proficiency: number;
  priority?: number | null;
  start_date?: string | null;
  end_date?: string | null;
  status: string;
}

export interface UserSkillResponseI extends UserSkillWithNameI {}

export interface SkillResponseI {
  id: number;
  name: string;
}

export interface SkillProcessI {
  id_skill: number;
  id_user: number;
  proficiency: number; // 0..100
  priority: number;
  start_date: string;  // ISO
  end_date: string;    // ISO
  status?: "process";  // приходит как "process", но мы не используем
  name: string;
}
