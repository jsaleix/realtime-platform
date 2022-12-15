import React, { lazy, useState, useEffect } from "react";
import { Routes, Route, Link, NavLink } from "react-router-dom";
import { useAppContext } from "../../contexts/app-context";
import style from "./index.module.scss";

const PageIntrouvable = lazy(() => import("../404/404"));
const AdminPannel = lazy(() => import("./pannel/pannel"));
const UserList = lazy(() => import("./users"));
const Conversations = lazy(() => import("./conversations"));

const navLinkStyle = ({isActive}) => isActive ? style.active : ""

export default function Admin() {
	const { appState } = useAppContext();

    if(appState.auth.isAdmin === false){
        return <div className="container">RESTRICTED ACCESS</div>
    }

    return (
        <>
            <div className="container">
                <div className={style.admin_nav}>
                    <NavLink className={navLinkStyle} to={"/admin"} end>Realtime Panel</NavLink>
                    <NavLink className={navLinkStyle} to="/admin/users">Users</NavLink>
                    <NavLink className={navLinkStyle} to="/admin/conversations">Conversation requests</NavLink>
                </div>
            </div>
            <Routes>
                <Route path="/conversations" element={<Conversations/>} />
                <Route exact path="/" element={<AdminPannel/>} />
                <Route path="/users" element={<UserList/>}/>
                <Route path="*" element={<PageIntrouvable />} />
            </Routes>
        </>
    );
}