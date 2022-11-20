import React from "react";
import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/navbar/navbar';
import AdminRooter from "./pages/admin/admin";

const Home = lazy(() => import('./pages/home/home'));
const Login = lazy(() => import('./pages/login/login'));
const SignUp = lazy(() => import('./pages/sign-up/sign-up'));
const PageIntrouvable = lazy(() => import("./pages/404/404"));

export default function AppRouter(){
    return(
        <>
            <Navbar/>
            <Suspense fallback={<div>Loading...</div>}>
                <Routes>
                    <Route path="/login" element={<Login/>}/>
                    <Route path="/sign-up" element={<SignUp/>}/>
                    <Route path="/admin/*" element={<AdminRooter />} />
                    <Route path="/" element={<Home/>}/>
                    <Route path="*" element={<PageIntrouvable/>}/>
                </Routes>
            </Suspense>
        </>
    )
}