export interface ExperienceBaseI {
  title: string
  id_profession?: number | null
  description?: string | null
  start_time: string
  end_time?: string | null
}

export type ExperienceCreateI = ExperienceBaseI
export type ExperienceUpdateI = ExperienceBaseI

export interface ExperienceResponseI extends ExperienceBaseI {
  id: number
  id_user: number
}
