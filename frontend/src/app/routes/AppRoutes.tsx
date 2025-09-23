import {AuthenticatedRoutes} from "@/app/routes/routes-wrapper/AuthenticatedRoutes";

export const AppRoutes = (): JSX.Element => {

    let RouteComponent = AuthenticatedRoutes;

    return <RouteComponent />;
}