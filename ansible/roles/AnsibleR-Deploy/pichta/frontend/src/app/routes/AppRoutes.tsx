import {AuthenticatedRoutes} from "@/app/routes/routes-wrapper/AuthenticatedRoutes";
import { useAuth } from '@/app/context/auth-provider/AuthProvider';
import { UnAuthenticatedRoutes } from "./routes-wrapper/UnAuthenticatedRoutes";

export const AppRoutes = (): JSX.Element => {
  const { authenticated } = useAuth();
  const RouteComponent = authenticated ? AuthenticatedRoutes : UnAuthenticatedRoutes;
  return <RouteComponent />;
}