import React, { useState, useEffect, useCallback } from "react";
import { io } from "socket.io-client";
import {
    CONVERSATION_RECEIVED_EVENTS,
    CONVERSATION_EMITTED_EVENTS,
} from "../../../constants/wss-events";
import { useAppContext } from "../../../contexts/app-context";
import style from "./index.module.scss";

const Conversation = ({ socket, close }) => {
    const { appState } = useAppContext();
    const [messages, setMessages] = useState([]);

    return <div className={style.conversation}>pas mal</div>;
};

const Requests = ({ socket, handleRequest }) => {
    const [requests, setRequests] = useState([]);

    useEffect(()=>{
        if(!socket){
            return;
        }
        console.log("getting requests");
        socket.emit(CONVERSATION_EMITTED_EVENTS.GET_USERS_WAITING);

        socket.on(
            CONVERSATION_RECEIVED_EVENTS.USERS_WAITING,
            ({ users_waiting }) => {
                setRequests(users_waiting);
            }
        );

        return () => {
            socket.off(CONVERSATION_RECEIVED_EVENTS.USERS_WAITING);
        }
    }, [socket]);

    return (
        <div className={style.requests}>
            <h2>Requests</h2>
            {requests.length > 0 ? (
                requests.map((item, index) => (
                    <div key={index} className={style.request}>
                        <p>{item.name}</p>
                        <button
                            onClick={() => handleRequest(requests[index].id)}
                            className={"btn blue"}
                        >
                            Handle this request
                        </button>
                    </div>
                ))
            ) : (
                <p>No requests</p>
            )}
        </div>
    );
};

const Conversations = () => {
    const [socket, setSocket] = useState(null);
    const { appState } = useAppContext();
    const [currentConversation, setCurrentConversation] = useState(null);

    const handleRequest = useCallback(
        (userId) => {
            socket.emit(CONVERSATION_EMITTED_EVENTS.ACCEPT_REQUEST, {
                user_id: userId
            });
            setCurrentConversation(userId);
        },
        [socket]
    );

    useEffect(() => {
        const { token } = appState.auth;
        const tmpSocket = io("http://localhost:3000", {
            path: "/conversation",
            auth: { token },
        });
        setSocket(tmpSocket);

        return () => {
            console.log("disconnect");
            tmpSocket.close();
            tmpSocket.disconnect();
        };
    }, []);

    return (
        <div className={style.conversations}>
            <section>
                <div className="container">
                    {currentConversation ? (
                        <Conversation socket={socket} close={null} />
                    ) : (
                        <Requests
                            socket={socket}
                            handleRequest={handleRequest}
                        />
                    )}
                </div>
            </section>
        </div>
    );
};

export default Conversations;
