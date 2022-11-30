import React, { lazy, useState, useEffect } from "react";
import { Routes, Route, Link, NavLink } from "react-router-dom";
import { useAppContext } from "../../contexts/app-context";
import style from "./index.module.scss";

const PageIntrouvable = lazy(() => import("../404/404"));
const AdminPannel = lazy(() => import("./pannel/pannel"));
const UserList = lazy(() => import("./users"));

const navLinkStyle = ({isActive}) => isActive ? style.active : ""

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
            (<>
                <div className="container">
                    <div className={style.admin_nav}>
                        <NavLink className={navLinkStyle} to={"/admin"} end>Realtime Panel</NavLink>
                        <NavLink className={navLinkStyle} to="/admin/users">Users</NavLink>
                    </div>
                </div>
                <Routes>
                    <Route exact path="/" element={<AdminPannel/>} />
                    <Route path="/users" element={<UserList/>}/>
                    <Route path="*" element={<PageIntrouvable />} />
                </Routes>
            </>)
            :
            "FORBIDDEN"
        }
        </div>
    );
}