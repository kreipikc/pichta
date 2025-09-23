import {PageType, RouteName, RoutesType} from "./types";

import {Authorization as AuthPage} from "@/pages/authorization/Authorization";
import { Registration } from "@/pages/registration/Registration";
import { ForgotPassword } from "@/pages/forgot_password/ForgotPassword";
import { UserProfilePage } from "@/pages/user/UserProfilePage";
import { QuestionnairePage } from "@/pages/questionnaire/QuestionnairePage"
import { SkillGraphPage } from "@/pages/graph/SkillGraphPage"
import GanttChartPage from "@/pages/gantt/GanttChart";

export const routes: RoutesType = {
    [RouteName.Auth]: {
        title: "Auth",
        path: "/",
        component: AuthPage,
        type: PageType.authenticated,
    },
    [RouteName.Register]: {
        title: "Register",
        path: "/register",
        component: Registration,
        type: PageType.authenticated,
    },
    [RouteName.ForgotPassword]: {
        title: "ForgotPassword",
        path: "/forgot-password",
        component: ForgotPassword,
        type: PageType.authenticated,
    },
    [RouteName.UserProfile]: {
        title: "Профиль",
        path: "/user/profile",
        component: UserProfilePage,
        type: PageType.authenticated,
      },
      [RouteName.Questionnaire]: {
        title: "Опросник",
        path: "/questionnaire",
        component: QuestionnairePage,
        type: PageType.authenticated,
      },
      [RouteName.Graph]: {
        title: "Граф",
        path: "/graph",
        component: SkillGraphPage,
        type: PageType.authenticated,
      },
      [RouteName.GanttChart]: {
        title: "Диаграмма Гантта",
        path: "/gantt",
        component: GanttChartPage,
        type: PageType.authenticated,
      }
};