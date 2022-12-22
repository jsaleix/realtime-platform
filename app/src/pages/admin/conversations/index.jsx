import React, { useState, useEffect, useCallback } from "react";
import { io } from "socket.io-client";
import {
    CONVERSATION_BACK_EVENTS,
    CONVERSATION_FRONT_EVENTS,
} from "../../../constants/wss-events";
import { useAppContext } from "../../../contexts/app-context";
import style from "./index.module.scss";

import Requests from "./requests";
import Conversation from "./conversation";

const Conversations = () => {
    const [socket, setSocket] = useState(null);
    const { appState } = useAppContext();
    const [currentConversation, setCurrentConversation] = useState(null);

    const handleRequest = useCallback(
        (userId) => {
            socket.emit(CONVERSATION_FRONT_EVENTS.ACCEPTED_REQUEST_ADMIN, {
                user_id: userId,
            });
            setCurrentConversation(userId);
        },
        [socket]
    );

    useEffect(() => {
        const { token } = appState.auth;
        const tmpSocket = io("http://localhost:3000/conversation", {
            auth: { token },
        });
        setSocket(tmpSocket);

        return () => {
            tmpSocket.disconnect();
        };
    }, []);

    return (
        <div className={style.conversations}>
            <section>
                <div className="container">
                    {currentConversation ? (
                        <Conversation
                            socket={socket}
                            close={() => setCurrentConversation(null)}
                        />
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
