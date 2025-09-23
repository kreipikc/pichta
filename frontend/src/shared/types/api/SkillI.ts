export interface UserSkillBaseI {
  id_skill: number
  id_user: number
  proficiency: number
  priority?: number | null
  start_date?: string | null
  end_date?: string | null
  status: string
  name: string
}

export type UserSkillCreateI = UserSkillBaseI

export interface UserSkillResponseI extends UserSkillBaseI {}

export interface SkillResponseI {
  id: number
  name: string
}
