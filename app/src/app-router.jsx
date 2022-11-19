import React from "react";
import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/navbar/navbar';

const Home = lazy(() => import('./pages/home/home'));
const Login = lazy(() => import('./pages/login/login'));
const SignUp = lazy(() => import('./pages/sign-up/sign-up'));

export default function AppRouter(){
    return(
        <>
            <Navbar/>
            <Suspense fallback={<div>Loading...</div>}>
                <Routes>
                    <Route path="/login" element={<Login/>}/>
                    <Route path="/sign-up" element={<SignUp/>}/>
                    <Route path="/" element={<Home/>}/>
                </Routes>
            </Suspense>
        </>
    )
}