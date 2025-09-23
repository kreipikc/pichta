export const API_BASE_URL = '/api'

// Auth
export const AUTH_PREFIX = 'auth'
export const AUTH_LOGIN_PATH = `${AUTH_PREFIX}/login`
export const AUTH_REGISTER_PATH = `${AUTH_PREFIX}/register`
export const AUTH_REFRESH_PATH = `${AUTH_PREFIX}/refresh_token`
export const AUTH_LOGOUT_PATH = `${AUTH_PREFIX}/logout`

// Users (self + admin)
export const USER_PREFIX = 'user'
export const USER_ME_PATH = `${USER_PREFIX}/me`
export const USER_ABOUTME_PATH = `${USER_PREFIX}/aboutme`
export const USER_GETALL_PATH = `${USER_PREFIX}/getall`
export const USER_UPDATE_PATH = `${USER_PREFIX}/update` // + /{user_id}
export const USER_DELETE_PATH = `${USER_PREFIX}/delete` // + /{user_id}

// For Myself
export const ME_PREFIX = 'me'
export const ME_WANTED_PROFESSION_ADD_PATH = `${ME_PREFIX}/wanted_prof/add`

// Education
export const EDUC_PREFIX = 'educ'
export const EDUC_GETALL_PATH = `${EDUC_PREFIX}/getall`
export const EDUC_GET_PATH = `${EDUC_PREFIX}/get` // + /{education_id}
export const EDUC_ADD_PATH = `${EDUC_PREFIX}/add`
export const EDUC_UPDATE_PATH = `${EDUC_PREFIX}/update` // + /{education_id}
export const EDUC_DELETE_PATH = `${EDUC_PREFIX}/delete` // + /{education_id}

// Experience
export const EXPER_PREFIX = 'exper'
export const EXPER_GETALL_PATH = `${EXPER_PREFIX}/getall`
export const EXPER_GET_PATH = `${EXPER_PREFIX}/get` // + /{experience_id}
export const EXPER_ADD_SELF_PATH = `${EXPER_PREFIX}/add`
export const EXPER_ADD_FOR_USER_PATH = `${EXPER_PREFIX}/add` // + /{user_id}
export const EXPER_UPDATE_PATH = `${EXPER_PREFIX}/update` // + /{experience_id}
export const EXPER_DELETE_PATH = `${EXPER_PREFIX}/delete` // + /{experience_id}

// Profession
export const PROF_PREFIX = 'prof'
export const PROF_GETALL_PATH = `${PROF_PREFIX}/getall`
export const PROF_GET_PATH = `${PROF_PREFIX}/get` // + /{profession_id}
export const PROF_ADD_PATH = `${PROF_PREFIX}/add`
export const PROF_UPDATE_PATH = `${PROF_PREFIX}/update` // + /{profession_id}
export const PROF_DELETE_PATH = `${PROF_PREFIX}/delete` // + /{profession_id}

// Skill
export const SKILL_PREFIX = 'skill'
export const SKILL_GETALL_SELF_PATH = `${SKILL_PREFIX}/getall`
export const SKILL_GET_ONE_SELF_PATH = `${SKILL_PREFIX}/get` // backend shows '/get/'
export const SKILL_ADD_PATH = `${SKILL_PREFIX}/add`
export const SKILL_UPDATE_PATH = `${SKILL_PREFIX}/update`
export const SKILL_DELETE_PATH = `${SKILL_PREFIX}/delete` // + /{skill_id}

// Task
export const TASK_PREFIX = 'task'
export const TASK_GETALL_PATH = `${TASK_PREFIX}/getall`
export const TASK_GET_PATH = `${TASK_PREFIX}/get` // + /{task_id}
export const TASK_ADD_SELF_PATH = `${TASK_PREFIX}/add`
export const TASK_ADD_FOR_USER_PATH = `${TASK_PREFIX}/add` // + /{user_id}
export const TASK_UPDATE_PATH = `${TASK_PREFIX}/update` // + /{task_id}
export const TASK_DELETE_PATH = `${TASK_PREFIX}/delete` // + /{task_id}`)
