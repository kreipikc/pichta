import React from "react";
import ReactDOM from "react-dom/client";
import '@fontsource-variable/inter';
import '@fontsource-variable/manrope';

import App from "@/app/App";

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)

import "./index.css"
import "@mantine/core/styles.css";

root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
)