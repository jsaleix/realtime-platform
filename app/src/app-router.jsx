import React from "react";
import { useEffect, useState, lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/navbar/navbar";
import { useAppContext } from "./contexts/app-context";
import { SSE_URL, API_URL } from "./constants/urls";
import { useCallback } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LogRocket from "logrocket";

const Home = lazy(() => import("./pages/home/home"));
const Login = lazy(() => import("./pages/login/login"));
const SignUp = lazy(() => import("./pages/sign-up/sign-up"));
const PageIntrouvable = lazy(() => import("./pages/404/404"));
const AdminIndex = lazy(() => import("./pages/admin"));
const CGUModal = lazy(() => import("./components/cgu-modal"));

export default function AppRouter() {
    const { appState, dispatch } = useAppContext();
    const [cguModalVisible, setCguModalVisible] = useState(false);

    useEffect(() => {
        if (appState.cgu_accepted) {
            LogRocket.init("uvgdko/test-96ihm");
            if (appState.auth) {
                LogRocket.identify(appState.auth.id, {
                    name:
                        appState.auth.firstName +
                            " " +
                            appState.auth.lastName ?? "unset",
                    email: appState.auth.email ?? "unset",
                });
            }
        } else {
            console.log("NOT ACCEPTED");
        }
    }, [appState]);

    useEffect(() => {
        if (!appState.cgu_accepted) {
            setTimeout(() => {
                setCguModalVisible(true);
            }, 2000);
        }
    }, []);

    const initEventSource = useCallback(() => {
        let url = SSE_URL + "?";
        let { client_id } = appState;
        console.log("CALLED");
        if (client_id) {
            url += "client_id=" + client_id + "&";
        }

        if (appState.auth.token) {
            url += "token=" + appState.auth.token;
        }
        const eventSource = new EventSource(url, { withCredentials: true });

        eventSource.addEventListener("connect", (e) => {
            console.log("HERE");
            const clientId = JSON.parse(e.data).client_id;
            dispatch({
                action: "SET_CLIENT_ID",
                payload: { client_id: clientId },
            });
            console.log("connected", JSON.parse(e.data));
        });

        eventSource.addEventListener("error", (e) => {
            console.log(e);
        });

        eventSource.addEventListener("commerce", (e) => {
            const data = JSON.parse(e.data).message;
            toast(data);
        });

        eventSource.addEventListener("conversation_admins_available", (e) => {
            const data = JSON.parse(e.data).message;
            toast(data);
        });

        dispatch({ action: "SET_EVENT_SOURCE", payload: eventSource });
    }, [appState.auth]);

    useEffect(() => {
        initEventSource();
        return () => {
            if (
                appState.eventSource &&
                appState.eventSource.readyState !== EventSource.CLOSED
            ) {
                appState.eventSource.close();
            }
        };
    }, [appState.auth]);

    return (
        <>
            <Navbar />
            <ToastContainer />
            <Suspense fallback={<div>Loading...</div>}>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/sign-up" element={<SignUp />} />
                    <Route path="/admin/*" element={<AdminIndex />} />
                    <Route path="/" element={<Home />} />
                    <Route path="*" element={<PageIntrouvable />} />
                </Routes>
                <CGUModal
                    visible={cguModalVisible}
                    setVisible={setCguModalVisible}
                />
            </Suspense>
        </>
    );
}
