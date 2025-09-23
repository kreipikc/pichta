import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { userReducer } from "@/app/redux/store/reducers/userSlice";
import { errorToastMiddleware } from "@/app/redux/store/middlewares/errorToast";

import { authApi } from "@/app/redux/api/auth.api";
import { userApi } from "@/app/redux/api/user.api";
import { educationApi } from "@/app/redux/api/education.api";
import { experienceApi } from "@/app/redux/api/experience.api";
import { professionApi } from "@/app/redux/api/profession.api";
import { skillApi } from "@/app/redux/api/skill.api";
import { taskApi } from "@/app/redux/api/task.api";
import { meApi } from "@/app/redux/api/me.api";

const rootReducer = combineReducers({
  user: userReducer,
  [authApi.reducerPath]: authApi.reducer,
  [userApi.reducerPath]: userApi.reducer,
  [educationApi.reducerPath]: educationApi.reducer,
  [experienceApi.reducerPath]: experienceApi.reducer,
  [professionApi.reducerPath]: professionApi.reducer,
  [skillApi.reducerPath]: skillApi.reducer,
  [taskApi.reducerPath]: taskApi.reducer,
  [meApi.reducerPath]: meApi.reducer,
});

export const setupStore = () => {
  return configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware()
        .concat(authApi.middleware)
        .concat(userApi.middleware)
        .concat(educationApi.middleware)
        .concat(experienceApi.middleware)
        .concat(professionApi.middleware)
        .concat(skillApi.middleware)
        .concat(taskApi.middleware)
        .concat(meApi.middleware)
        .concat(errorToastMiddleware),
  });
};

export type RootState = ReturnType<typeof rootReducer>;
export type AppStore = ReturnType<typeof setupStore>;
export type AppDispatch = AppStore['dispatch'];
