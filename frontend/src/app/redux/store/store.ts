import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { userReducer } from "@/app/redux/store/reducers/userSlice";
import { errorToastMiddleware } from "@/app/redux/store/middlewares/errorToast";
import { humidApi } from "@/app/redux/api/humid.api";
import { authApi } from "@/app/redux/api/auth.api";
import { tempApi } from "@/app/redux/api/temp.api";
import { predictApi } from "@/app/redux/api/predict.api";
import { roleApi } from "@/app/redux/api/role.api";
import { tagEndpointsApi } from "../api/endpoints.api";
import { userApi } from "../api/user.api";
import { sensorsApi } from "../api/sensors.api";
import { dataApi } from "../api/data.api";

const rootReducer = combineReducers({
    user: userReducer,
    [authApi.reducerPath]: authApi.reducer,
    [humidApi.reducerPath]: humidApi.reducer,
    [tempApi.reducerPath]: tempApi.reducer,
    [predictApi.reducerPath]: predictApi.reducer,
    [roleApi.reducerPath]: roleApi.reducer,
    [tagEndpointsApi.reducerPath]: tagEndpointsApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [sensorsApi.reducerPath]: sensorsApi.reducer,
    [dataApi.reducerPath]: dataApi.reducer,
});

export const setupStore = () => {
    return configureStore({
        reducer: rootReducer,
        middleware: getDefaultMiddleware =>
            getDefaultMiddleware()
                .concat(authApi.middleware)
                .concat(humidApi.middleware)
                .concat(tempApi.middleware)
                .concat(predictApi.middleware)
                .concat(roleApi.middleware)
                .concat(tagEndpointsApi.middleware)
                .concat(userApi.middleware)
                .concat(sensorsApi.middleware)
                .concat(dataApi.middleware)
                .concat(errorToastMiddleware),
    });
};

export type RootState = ReturnType<typeof rootReducer>;
export type AppStore = ReturnType<typeof setupStore>;
export type AppDispatch = AppStore['dispatch'];
