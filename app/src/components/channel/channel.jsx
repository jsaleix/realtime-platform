import React, { useEffect, useState, useCallback } from "react";
import {io} from 'socket.io-client';
import { useAppContext } from "../../contexts/app-context";

export default function Channel({roomId}){
    const {appState} = useAppContext();
    const [messages, setMessages] = useState([]);
    // const [socket, setSocket] = useState(null);

    // const setupSocket = useCallback(() => {
    //     setMessages([]);
    //     const { token } = appState.auth;
    //     const tmpSocket = io("ws://localhost:3000", {path: "/ws", auth: {token, roomId}});

    //     tmpSocket.on('connect', () => {
    //         console.log('connected')
    //     });

    //     tmpSocket.on('user-connected', (data) => {
    //         console.log('user connected', data)
    //     });

    //     tmpSocket.on('disconnect', () => {
    //         console.log('disconnected')
    //     });

    //     setSocket(tmpSocket);
    // }, [socket]);

    // const closeSocket = useCallback(() => {
    //     if(socket?.id){
    //         socket.disconnect();
    //         setSocket(null);
    //     }else{
    //         console.log('no socket')
    //     }
    // }, [socket]);

    // useEffect(() => {
    //     closeSocket();
    //     if(!appState.auth.token) return;
    //     if(!socket?.id) setupSocket();
    //     () => closeSocket();
    // }, [roomId]);

    return(
        <div className="channel">
            <h1>Room {roomId}</h1>
            {socket && socket.id}
        </div>
    )
}