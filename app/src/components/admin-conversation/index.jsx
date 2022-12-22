import React, { useEffect, useState, useRef, useCallback } from "react";
import style from "./index.module.scss";
import { io } from "socket.io-client";
import { useAppContext } from "../../contexts/app-context";
import {
    CONVERSATION_BACK_EVENTS,
    CONVERSATION_FRONT_EVENTS,
} from "../../constants/wss-events";
import { SOCKET_CONVERSATION_URL } from "../../constants/urls";
import { displayMsg } from "../../utils/toast";
import ChatBox from "../chat-box";

export default function AdminConversation({ close }) {
    const { appState } = useAppContext();
    const [socket, setsocket] = useState(null);
    const [messages, setMessages] = useState([]);
    const [waiting, setWaiting] = useState(true);

    const sendMessage = useCallback(
        (input) => {
            if (socket) {
                socket.emit(CONVERSATION_FRONT_EVENTS.MESSAGE, input);
            }
        },
        [socket]
    );

    useEffect(() => {
        if (socket) {
            console.log("socket already set");
            return;
        }

        console.log("setting socket");
        const { token } = appState.auth;
        const tmpSocket = io( SOCKET_CONVERSATION_URL, {
            auth: { token },
        });

        tmpSocket.on(CONVERSATION_BACK_EVENTS.REQUEST_ACCEPTED, () => {
            console.log("REQUEST ACCEPTED");
            setWaiting(false);
        });

        tmpSocket.on(CONVERSATION_BACK_EVENTS.NEW_MESSAGE, (message) => {
            console.log("MESSAGE_RECEIVED", message);
            setMessages((prev) => [...prev, message]);
        });

        tmpSocket.on(CONVERSATION_BACK_EVENTS.ADMIN_LEFT, () => {
            displayMsg("Admin left the conversation", "error");
            close();
        });

        setsocket(tmpSocket);

        return () => {
            if (tmpSocket) {
                console.log("front disconnected");
                tmpSocket.disconnect();
                tmpSocket.off(CONVERSATION_BACK_EVENTS.REQUEST_ACCEPTED);
                tmpSocket.off(CONVERSATION_BACK_EVENTS.NEW_MESSAGE);
                tmpSocket.off(CONVERSATION_BACK_EVENTS.ADMIN_LEFT);
                setsocket(null);
                setMessages([]);
            }
        };
    }, []);

    return (
        <div className={style.chatbot}>
            <div className={style.chatbot_header}>
                <h2>Conversation with an Admin</h2>
                <svg
                    onClick={close}
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M9.17 14.83L14.83 9.17M14.83 14.83L9.17 9.17M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z"
                        stroke="black"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </div>
            <div className={style.chatbot_messages}>
                {waiting ? (
                    <div className={style.waiting}>
                        <p>Waiting for an admin to connect...</p>
                    </div>
                ) : (
                    <ChatBox
                        messages={messages}
                        onSendMessage={sendMessage}
                        noMessageDefault="Start the conversation by sending a message"
                    />
                )}
            </div>
        </div>
    );
}
