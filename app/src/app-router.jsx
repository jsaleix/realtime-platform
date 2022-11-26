import React from "react";
import { useEffect, lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/navbar/navbar';
import AdminRooter from "./pages/admin/admin";
import { useAppContext } from "./contexts/app-context";
import { SSE_URL } from "./constants/urls";
import { useCallback } from "react";

const Home = lazy(() => import('./pages/home/home'));
const Login = lazy(() => import('./pages/login/login'));
const SignUp = lazy(() => import('./pages/sign-up/sign-up'));
const PageIntrouvable = lazy(() => import("./pages/404/404"));

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
			console.log("connected");
		});

        eventSource.addEventListener('error', (e) => {
            console.log()
            console.log(e);
        })

        dispatch({action: "SET_EVENT_SOURCE", payload: eventSource});
	}, [appState.auth]);

    useEffect(()=>{
		initEventSource();
		return () => {
			if(appState.eventSource && appState.eventSource instanceof EventSource){
				appState.eventSource.close();
			}
		}
	}, [appState.auth]);

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