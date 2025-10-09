import {FC} from "react";
import {Outlet} from "react-router-dom";

import {AppWrapper} from "@/components/app-wrapper/AppWrapper";
import {ToastContainer} from "react-toastify";


export const AppLayout: FC = (): JSX.Element => (
    <AppWrapper>
        <Outlet/>
        <ToastContainer/>
    </AppWrapper>
)