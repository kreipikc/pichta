import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {UserInfoI} from "@/shared/types/api/UserI";

type UserState = {
    currentUser: UserInfoI | null
}

const initialState: UserState = {
    currentUser: null
}

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        addUser(state, action: PayloadAction<UserInfoI>) {
            state.currentUser = action.payload
        },
        deleteUser(state) {
            state.currentUser = null
        }
    }
})

export const userReducer = userSlice.reducer
export const userActions = userSlice.actions