import {useMemo} from "react";
import {useNavigate} from "react-router-dom";
import {RouteName} from "@/app/routes/types";
import {generateRoutePath} from "@/app/routes/helper";



type NavigateType = {[k: string]: ()=> void}

type RoutesReturnType = {
    paths: RoutesPathType
    navigateTo: NavigateType
}

export type RoutesPathType = Record<keyof typeof RouteName, string>

export const useRoutes = (): RoutesReturnType => {
    const navigate = useNavigate()

    const Auth = useMemo(
        ()=> generateRoutePath({
            name: RouteName.Auth
        }),
        []
    )

    const Register = useMemo(
        ()=> generateRoutePath({
            name: RouteName.Register
        }),
        []
    )

    const ForgotPassword = useMemo(
        ()=> generateRoutePath({
            name: RouteName.ForgotPassword
        }),
        []
    )
    const UserProfile = useMemo(
        ()=> generateRoutePath({
            name: RouteName.UserProfile
        }),
        []
    )
    const Questionnaire = useMemo(
        ()=> generateRoutePath({
            name: RouteName.Questionnaire
        }),
        []
    )
    const Graph = useMemo(
        ()=> generateRoutePath({
            name: RouteName.Graph
        }),
        []
    )
    const GanttChart = useMemo(
        ()=> generateRoutePath({
            name: RouteName.GanttChart
        }),
        []
    )

    const paths: RoutesPathType = useMemo(()=> {
        return {
            Auth,
            Register,
            ForgotPassword,
            UserProfile,
            Questionnaire,
            Graph,
            GanttChart,
        }
    }, [
        Auth,
        Register,
        ForgotPassword,
        UserProfile,
        Questionnaire,
        Graph,
        GanttChart,
    ])

    const navigateTo: NavigateType = useMemo(
        ()=> Object.entries(paths).reduce((acc, [key,value]) => {
            return {
                ...acc,
                [key]: ()=> navigate(value),
            }
        }, {}), [navigate, paths])


    return {
        paths,
        navigateTo
    }
}