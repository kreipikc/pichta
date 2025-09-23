export interface UserI {
    username: string | null;                   
    id_base_role: number | null;           
    id_extra_role?: number | null;   
    date_start_extra_role_id?: string | null; 
    date_stop_extra_role_id?: string | null; 
    is_active: boolean | null           
}

export interface LogInI {
    username: string,
    password: string
}

export interface TokenI {
    access_token: string,
    token_type: string
}

