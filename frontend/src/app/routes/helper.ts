import {generatePath, Params} from "react-router-dom";

import {routes} from "@/app/routes/routes";
import {PageType, RouteName} from "@/app/routes/types";


export const commonRoutes = () => {
    Object.values(routes).filter(route => route.type === PageType.common)
}

export const authenticatedRoutes = () =>
    Object.values(routes).filter(
        route =>
            route.type.includes(PageType.authenticated) || route.type.includes(PageType.common)

    )

export const unAuthenticatedRoutes = () =>
    Object.values(routes).filter(
        route =>
            route.type.includes(PageType.unAuthenticated) || route.type.includes(PageType.common)
    )


export const generateRoutePath = ({
                                      name,
                                      params,
                                  }: {
    name: RouteName
    params?: Params<string>
}): string => {
    const route = routes[name]
    return generatePath(route.path, params)
}