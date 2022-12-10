import React, { useEffect, useState, useRef, useCallback } from "react";
import style from "./index.module.scss";
import { io } from "socket.io-client";

const MessageItem = ({ message, isCurrent, answerAction }) => {
    const [stringValue, setStringValue] = useState("0");
    const [dateValue, setDateValue] = useState(new Date());
    const [intValue, setIntValue] = useState(0);

    const renderPrompt = useCallback(() => {
        if(!message?.prompt || !message.prompt.type) return;

        switch( (message.prompt.type).toLowerCase() ){
            case "date":
                return(
                    <div >
                        <input
                            placeholder="Enter date here"
                            type="date"
                            value={dateValue}
                            onChange={e => setDateValue(e.target.value)}
                        />
                        <button onClick={() => answerAction({ value: dateValue})}>Send</button>
                    </div>
                )
            case "string":
                return(
                    <div >
                        <input
                            placeholder="Type your answer here"
                            type="text"
                            value={stringValue}
                            onChange={e => setStringValue(e.target.value)}
                        />
                        <button onClick={() => answerAction({ value: stringValue})}>Send</button>
                    </div>
                )
            case "int":
                return (
                    <div >
                        <input
                            placeholder="Type your answer here"
                            type="number"
                            value={intValue}
                            onChange={e => setIntValue(parseInt(e.target.value))}
                         />
                        <button onClick={() => answerAction({ value: intValue})}>Send</button>
                    </div>
                )

            case "controlled":
                return (
                    <>
                        {message.prompt.answers.map(({label, next}, index) => 
                            <div key={index}
                                className={style.action} 
                                onClick={() => answerAction({value: index})}
                            >
                                <p>{label}</p>
                            </div>)
                        }
                    </>
                )};

    }, [message, stringValue, dateValue, intValue]);

    return(
        <div className={style.message}>
            <div className={style.message_content}>
                <p>{message.label}</p>
            </div>
            {isCurrent && (
                <div className={style.actions}>
                    {renderPrompt()}
                </div>
            )}
        </div>
    )
};

const ChatBot = ({close}) => {
    const [socket, setsocket ] = useState(null);
    const [messages, setMessages] = useState([]);
    const lastMsgRef = useRef(null);
    const msgContainerRef = useRef(null);

    const answerAction = answer => {
        const { value, next } = answer;
        socket.emit("answer", {value, next});
    };

    const scrollToBottom = useCallback(()=> {
        if(lastMsgRef.current && msgContainerRef.current){
            const { offsetTop } = lastMsgRef.current;
            msgContainerRef.current.scrollTo({ top: offsetTop, behavior: 'smooth' });
        }
    }, [lastMsgRef, msgContainerRef]);

    useEffect(() => {
        const tmpSocket = io("http://localhost:3000", {path: "/chatbot"});

        tmpSocket.on("connect", () => {
            console.log("CONNECT");
        });

        tmpSocket.on("message_received", (msg) => {
            console.log(msg);
            setMessages(prevMsg => [...prevMsg, msg]);
        });

        if(!socket){
            setsocket(tmpSocket);
        }
        return () => {
            if(socket){
                socket.disconnect();
                socket.off("connect");
                socket.off("message_received");
                setsocket(null);
                setMessages([]);
            }
        }
    }, []);
    
    useEffect(()=>{
        scrollToBottom();
    }, [messages]);

    return(
        <div className={style.chatbot}>
            <div className={style.chatbot_header}>
                <h2>Conversation with our Bot</h2>
                <svg onClick={close} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9.17 14.83L14.83 9.17M14.83 14.83L9.17 9.17M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </div>
            <div className={style.chatbot_messages} ref={msgContainerRef}>
                {messages.length < 1 
                ? <p>No messages yet</p>
                : (<>
                    {messages.map((message, index) => 
                        <MessageItem
                            key={index}
                            message={message}
                            isCurrent={index === (messages.length - 1)}
                            answerAction={answerAction}
                        />
                    )}
                    <div ref={lastMsgRef}/>
                    </>
                )
                }
            </div>
        </div>
    )
}

export default ChatBot;