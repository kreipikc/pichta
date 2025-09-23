export const API_BASE_URL = '/api'

export const AUTH_PATH = 'auth'
export const LOGIN_PATH = `${AUTH_PATH}/token`
export const REFRESH_PATH = `${AUTH_PATH}/refresh_access_token`

export const USER_PATH = `user/me`
export const USER_ALL_PATH = `user/all`
export const USER_CREATE_PATH = `user/`

export const ROLE_PATH = `role`
export const ROLE_ALL_PATH = `${ROLE_PATH}/all`

export const HUMID_PATH = `humid/`
export const TEMP_PATH = `temp/`
export const SENSORS_PATH = `sensors`
export const REFERENCE_PATH = `reference`
export const SENSORS_HUMID_PATH = `${SENSORS_PATH}/${HUMID_PATH}`
export const REFERENCE_HUMID_PATH = `${REFERENCE_PATH}/${HUMID_PATH}`
export const SENSORS_TEMP_PATH = `${SENSORS_PATH}/${TEMP_PATH}`
export const REFERENCE_TEMP_PATH = `${REFERENCE_PATH}/${TEMP_PATH}`

export const PREDICT_PATH = `predict/`

export const DATA_PATH = `data`
export const DATA_COUNT_PATH = `${DATA_PATH}/count`
export const ALL_DATA_PATH = `${DATA_COUNT_PATH}/all`
export const DATA_IMPORT_PATH = `${DATA_PATH}/import`
export const DATA_EXPORT_PATH = `${DATA_PATH}/export`

export const TAG_ENDPOINTS_PATH = `tag_endpoint/all`