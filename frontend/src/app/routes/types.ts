import { ComponentType} from "react";

export interface RouteConfig {
    title: string
    path: string
    component: ComponentType
    type: PageType | PageType[]
}

export enum PageType {
    common = "common",
    authenticated = "authenticated",
    unAuthenticated = 'unAuthenticated'
}

export type RoutesType = Record<RouteName, RouteConfig>

export enum RouteName {
    Auth = "auth",
    Register = "register",
    ForgotPassword = "forgotPassword",
    UserProfile = "userProfile",
    Questionnaire = "questionnaire",
    Graph = "graph",
    GanttChart = "ganttChart",
}