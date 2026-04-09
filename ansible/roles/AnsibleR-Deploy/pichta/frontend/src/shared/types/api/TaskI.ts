export interface TaskBaseI {
  title: string
  description?: string | null
  status?: string | null
  start_time?: string | null
  end_time?: string | null
}

export interface TaskCreateSelfI extends TaskBaseI {
  created_from: number
}

export interface TaskCreateI extends TaskBaseI {
  created_from: number
}

export interface TaskUpdateI extends TaskBaseI {}

export interface TaskResponseI extends TaskBaseI {
  id: number
  id_user: number
  created_from: number
}
