import React, { lazy, useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { useAppContext } from "../../contexts/app-context";

const PageIntrouvable = lazy(() => import("../404/404"));
const AdminPannel = lazy(() => import("./pannel/pannel"));

export default function Admin() {
	const { appState } = useAppContext();
    const [ hasAccess, setHasAccess ] = useState(false);

    useEffect(() => {
        if(appState.auth.isAdmin === true){
        setHasAccess(true);
        }
    }, [appState.auth]);

    return (
        <div>
        {
            hasAccess ?
            <Routes>
                <Route path="/" element={<AdminPannel/>} />
                <Route path="*" element={<PageIntrouvable />} />
            </Routes>
            :
            "FORBIDDEN"
        }
        </div>
    );
}