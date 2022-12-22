import React, { useState, useEffect, useCallback } from "react";
import { io } from "socket.io-client";
import {
    CONVERSATION_BACK_EVENTS,
    CONVERSATION_FRONT_EVENTS,
} from "../../../constants/wss-events";
import { useAppContext } from "../../../contexts/app-context";
import style from "./index.module.scss";
import { displayMsg } from "../../../utils/toast";
import ChatBox from "../../../components/chat-box";

const Conversation = ({ socket, close }) => {
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        socket.on(CONVERSATION_BACK_EVENTS.USER_LEFT, () => {
            close();
            displayMsg("User left the conversation", "error");
        });

        socket.on(CONVERSATION_BACK_EVENTS.NEW_MESSAGE, (message) => {
            setMessages((prev) => [...prev, message]);
        });

        return () => {
            socket.off(CONVERSATION_BACK_EVENTS.USER_LEFT);
            socket.off(CONVERSATION_BACK_EVENTS.NEW_MESSAGE);
        };
    }, [socket]);

    const sendMessage = useCallback(
        (input) => {
            if (socket) {
                socket.emit(CONVERSATION_FRONT_EVENTS.MESSAGE, input);
            }
        },
        [socket]
    );

    return (
        <div className={style.conversation}>
            <ChatBox messages={messages} onSendMessage={sendMessage} />
        </div>
    );
};

const Requests = ({ socket, handleRequest }) => {
    const [requests, setRequests] = useState([]);

    useEffect(() => {
        if (!socket) {
            return;
        }
        console.log("getting requests");
        socket.emit(CONVERSATION_FRONT_EVENTS.GET_USERS_WAITING_ADMIN);

        socket.on("connect_error", () => {
            console.log("connect_error");
        });

        socket.on(
            CONVERSATION_BACK_EVENTS.USERS_WAITING,
            ({ users_waiting }) => {
                setRequests(users_waiting);
            }
        );

        return () => {
            socket.off(CONVERSATION_BACK_EVENTS.USERS_WAITING);
        };
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
