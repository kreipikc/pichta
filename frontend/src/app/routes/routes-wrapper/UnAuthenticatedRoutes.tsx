import { Navigate, Route, Routes } from 'react-router-dom'


import { RouteConfig } from '../types'
import {useRoutes} from "@/hooks/useRoutes";
import {AppLayout} from "@/layout/app-layout/AppLayout";
import {unAuthenticatedRoutes} from "@/app/routes/helper";

export function UnAuthenticatedRoutes(): JSX.Element {
    const { paths } = useRoutes()
    return (
        <Routes>
            <Route element={<AppLayout />}>
                {unAuthenticatedRoutes().map(
                    ({ title, component: Element, path }: RouteConfig) => {
                        return <Route key={title} element={<Element />} path={path} />
                    }
                )}
                <Route key={-1} path="/" element={<Navigate to={paths.Auth} />} />
            </Route>
        </Routes>
    )
}