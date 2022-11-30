import React from "react";
import { useEffect, lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/navbar/navbar';
import { useAppContext } from "./contexts/app-context";
import { SSE_URL } from "./constants/urls";
import { useCallback } from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Home = lazy(() => import('./pages/home/home'));
const Login = lazy(() => import('./pages/login/login'));
const SignUp = lazy(() => import('./pages/sign-up/sign-up'));
const PageIntrouvable = lazy(() => import("./pages/404/404"));
const AdminIndex = lazy(() => import("./pages/admin"));

export default function AppRouter(){
	const { appState, dispatch } = useAppContext();
    const initEventSource = useCallback(() => {
		let url = SSE_URL + "?";
		let { client_id } = appState;

		if(client_id){
			url += "client_id=" + client_id + "&";
		}
	
		if(appState.auth.token){
			url += "token=" + appState.auth.token;
		}
		const eventSource = new EventSource( url, { withCredentials: true } );
		
		eventSource.addEventListener('connect', (e) => {
			const clientId = JSON.parse(e.data).client_id;
			dispatch({action: "SET_CLIENT_ID", payload: {client_id: clientId}});
			console.log("connected", JSON.parse(e.data));
		});

        eventSource.addEventListener('error', (e) => {
            console.log(e);
        })

        eventSource.addEventListener('commerce', (e) => {
            const data = JSON.parse(e.data).message;
            toast(data);
        })

        dispatch({action: "SET_EVENT_SOURCE", payload: eventSource});
	}, [appState.auth]);

    useEffect(()=>{
		initEventSource();
		return () => {
			if(appState.eventSource && appState.eventSource.readyState !== EventSource.CLOSED){
                appState.eventSource.close();
			}
		}
	}, [appState.auth]);

    return(
        <>
            <Navbar/>
            <ToastContainer />
            <Suspense fallback={<div>Loading...</div>}>
                <Routes>
                    <Route path="/login" element={<Login/>}/>
                    <Route path="/sign-up" element={<SignUp/>}/>
                    <Route path="/admin/*" element={<AdminIndex />} />
                    <Route path="/" element={<Home/>}/>
                    <Route path="*" element={<PageIntrouvable/>}/>
                </Routes>
            </Suspense>
        </>
    )
}