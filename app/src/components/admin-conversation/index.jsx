import React, { useEffect, useState, useRef, useCallback } from "react";
import style from "./index.module.scss";
import { io } from "socket.io-client";
import { useAppContext } from "../../contexts/app-context";

export default function AdminConversation({close}) {
  const { appState } = useAppContext();
  const [socket, setsocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const lastMsgRef = useRef(null);
  const msgContainerRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    // if(lastMsgRef.current && msgContainerRef.current){
    //     const { offsetTop } = lastMsgRef.current;
    //     msgContainerRef.current.scrollTo({ top: offsetTop, behavior: 'smooth' });
    // }
  }, [lastMsgRef, msgContainerRef]);

  useEffect(() => {
    const { token } = appState.auth;
    const tmpSocket = io("http://localhost:3000", {
      path: "/conversation",
      auth: { token },
    });

    tmpSocket.on("connect", () => {
      console.log("CONNECT");
    });

    // tmpSocket.on("message_received", (msg) => {
    //     // console.log(msg);
    //     setMessages(prevMsg => [...prevMsg, msg]);
    // });

    if (!socket) {
      setsocket(tmpSocket);
    }
    return () => {
      if (socket) {
        socket.disconnect();
        socket.off("connect");
        socket.off("message_received");
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
        {messages.length < 1 ? (
          <p>No messages yet</p>
        ) : (
          <>
            {null}
            <div ref={lastMsgRef} />
          </>
        )}
      </div>
    </div>
  );
}
