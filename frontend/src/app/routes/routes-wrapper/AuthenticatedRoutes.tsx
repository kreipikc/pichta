import {Navigate, Route, Routes,} from 'react-router-dom'


import { RouteConfig } from '../types'
import {authenticatedRoutes} from "@/app/routes/helper";
import {AppLayout} from "@/layout/app-layout/AppLayout";
import {useRoutes} from "@/hooks/useRoutes";

export function AuthenticatedRoutes(): JSX.Element {
    const { paths } = useRoutes()
    return (
        <Routes>
            <Route element={<AppLayout />}>
                {authenticatedRoutes().map(
                    ({ title, component: Element, path }: RouteConfig) => (
                        <Route key={title} element={<Element />} path={path} />
                    )
                )}
                <Route key={-1} path="*" element={<Navigate to={paths.UserProfile} />} />
            </Route>
        </Routes>
    )
}