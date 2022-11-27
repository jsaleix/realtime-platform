import React, { createContext, useContext, useReducer } from "react";
import { useMemo } from "react";
import { io } from "socket.io-client";
import { useAppContext } from "./app-context";
import { SOCKET_URL } from "../constants/urls";
import { useCallback } from "react";
import { useEffect } from "react";

const SocketContext = createContext();

export const useSocketContext = () => {
    const context = useContext(SocketContext);

    if(context === undefined){
        throw new Error('Missing Socket Context Provider');
    }

    return context;
}

export const SocketContextProvider = ({children}) => {
    const { appState: { auth:{ token } }, dispatch } = useAppContext();
    const socket = useMemo(() => io(SOCKET_URL, {
                                autoConnect: false,
                                path: "/ws",
                                auth: { token },
                                }, [token]) )

    const closeSocket = useCallback(() => {
        socket.close();
        socket.disconnect();
        console.log('Socket Disconnected');
    }, [socket]);

    const openSocket = useCallback(() => {
        if(!token) return;
        if(socket.disconnected){
            console.log('Socket Connected');
            socket.connect();
        }else{
            console.log('Socket Already Connected');
        }
    }, [socket]);

    return (
        <SocketContext.Provider value={{socket, closeSocket, openSocket}}>
            {children}
        </SocketContext.Provider>
    );
}
