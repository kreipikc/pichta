export interface EducationBaseI {
  id_user: number
  type: string
  direction: string
  start_time?: string | null
  end_time?: string | null
}

export type EducationCreateI = EducationBaseI

export interface EducationUpdateI extends EducationBaseI {}

export interface EducationResponseI extends EducationBaseI {
  id: number
}
