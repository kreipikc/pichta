export interface ProfessionBaseI {
  name: string
  lvl?: string | null
}

export type ProfessionCreateI = ProfessionBaseI

export interface ProfessionUpdateI {
  name?: string
  lvl?: string | null
}

export interface ProfessionResponseI extends ProfessionBaseI {
  id: number
}
