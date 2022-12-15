import React, { useEffect, useState, useRef, useCallback } from "react";
import style from "./index.module.scss";
import { io } from "socket.io-client";
import { useAppContext } from "../../contexts/app-context";
import {
  CONVERSATION_BACK_EVENTS,
  CONVERSATION_FRONT_EVENTS,
} from "../../constants/wss-events";
import { displayMsg } from "../../utils/toast";

export default function AdminConversation({ close }) {
  const { appState } = useAppContext();
  const [socket, setsocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const lastMsgRef = useRef(null);
  const msgContainerRef = useRef(null);
  const [waiting, setWaiting] = useState(true);
  const [input, setInput] = useState("");
  
  const sendMessage = useCallback(() => {
    if (socket && input) {
      socket.emit(CONVERSATION_FRONT_EVENTS.MESSAGE, input);
      setInput("");
    }
  }, [socket, input]);

  const scrollToBottom = useCallback(() => {
    // if(lastMsgRef.current && msgContainerRef.current){
    //     const { offsetTop } = lastMsgRef.current;
    //     msgContainerRef.current.scrollTo({ top: offsetTop, behavior: 'smooth' });
    // }
  }, [lastMsgRef, msgContainerRef]);

  useEffect(() => {
    if (socket) {
      console.log("socket already set");
      return;
    }

    console.log("setting socket");
    const { token } = appState.auth;
    const tmpSocket = io("http://localhost:3000/conversation", {
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

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
      <div className={style.chatbot_messages} ref={msgContainerRef}>
        {
          waiting ?
          <div className={style.waiting}>
            <p>Waiting for an admin to connect...</p>
          </div>
          :
          <>
            {
            messages.length === 0 
              ? 
              <div className={style.waiting}>
                <p>Start the conversation by sending a message</p>
              </div>
              :
              messages.map((msg, index) => <p key={index}>{JSON.stringify(msg)}</p>)
            }
            <div className={style.input}>
                <input 
                    type="text" 
                    placeholder="message" 
                    value={input} 
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && sendMessage()}
                />
                <button 
                    className="btn blue" 
                    onClick={sendMessage}>Send</button>
            </div>
          </>
        }
      </div>
    </div>
  );
}
