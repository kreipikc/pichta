import { toast } from 'react-toastify'

import type { Middleware } from '@reduxjs/toolkit'
import { isRejectedWithValue } from '@reduxjs/toolkit'

export const errorToastMiddleware: Middleware = () => next => action => {
    if (
        isRejectedWithValue(action) &&
        action.payload.data.detail !== 'Could not validate credentials' &&
        action.payload.data.detail !== 'Not authenticated'
    ) {
        console.log(action.payload.data.detail)
        const error = action.payload.data
            ? action.payload.data.detail
            : 'Something went wrong'
        toast.error(error)
    }

    return next(action)
}