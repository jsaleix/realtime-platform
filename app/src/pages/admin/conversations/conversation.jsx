import React, { useState, useEffect, useCallback } from "react";
import {
    CONVERSATION_BACK_EVENTS,
    CONVERSATION_FRONT_EVENTS,
} from "../../../constants/wss-events";
import style from "./index.module.scss";
import ChatBox from "../../../components/chat-box";
import { displayMsg } from "../../../utils/toast";

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

export default Conversation;
