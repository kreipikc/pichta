export type UserRole = 'user' | 'manager' | 'admin'

export interface UserInfoI {
  id: number
  login: string
  role: UserRole
  about_me?: string | null
  create_date: string
  update_time?: string | null
}

export interface UserUpdateI {
  login?: string
  about_me?: string | null
  password?: string
  role?: UserRole
}

export interface AboutMeCreateI {
  about_me: string
}

// Auth
export interface LogInI {
  login: string
  password: string
}

export interface TokenI {
  access_token: string
  token_type: string
}
