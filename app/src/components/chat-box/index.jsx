import style from "./index.module.scss";
import MessageItem from "../message-item/message-item";
import React, { useState, useCallback, useEffect, useRef } from "react";

const ChatBox = ({ messages, onSendMessage, noMessageDefault }) => {
    const [input, setInput] = useState("");
    const lastMsgRef = useRef(null);
    const msgContainerRef = useRef(null);

    const sendMessage = useCallback(() => {
        if (input) {
            onSendMessage(input);
            setInput("");
        }
    }, [input]);

    const scrollToBottom = useCallback(()=> {
        if(lastMsgRef.current && msgContainerRef.current){
            const { offsetTop } = lastMsgRef.current;
            msgContainerRef.current.scrollTo({ top: offsetTop, behavior: 'smooth' });
        }
    }, [lastMsgRef, msgContainerRef]);

    useEffect(()=>{
        scrollToBottom();
    }, [messages]);

    return (
        <div className={style.messages}>
            <div className={style.messagesContainer} ref={msgContainerRef}>
                {messages.length > 0 ? (
                    <>
                        {messages.map((message, index) => (
                            <MessageItem
                                key={index}
                                message={message}
                                displayUser={
                                    messages[index - 1] === undefined ||
                                    message.userId !==
                                        messages[index - 1].userId
                                }
                            />
                        ))}
                        <div ref={lastMsgRef} />
                    </>
                ) : (
                    <p>{noMessageDefault??"No messages"}</p>
                )}
            </div>
            <div className={style.input}>
                <input
                    type="text"
                    placeholder="message"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                />
                <button className="btn blue" onClick={sendMessage}>
                    Send
                </button>
            </div>
        </div>
    );
};

export default ChatBox;
