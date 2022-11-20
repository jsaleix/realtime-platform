import React, { useEffect, useState, useCallback } from "react";
import { useAppContext } from "../../contexts/app-context";
import { EMITTED_EVENTS, RECEIVED_EVENTS } from "../../constants/wss-events";
import MessageItem from "../message-item/message-item";
import style from "./channel.module.scss";

export default function Channel({roomId, pending, socket}){
    const {appState} = useAppContext();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");

    const sendMessage = useCallback(() => {
        socket.emit(EMITTED_EVENTS.MESSAGE, {message: input, roomId});
        setInput("");
    }, [socket, input]);

    useEffect(()=>{
        if(!socket || !socket.id ) return;

        socket.on(RECEIVED_EVENTS.NEW_MESSAGE, (message)=>{
            console.log("message", message);
            setMessages(msges => [...msges, message]);
        });

        return ()=>{
            socket.off(RECEIVED_EVENTS.NEW_MESSAGE);
        }
    }, []);

    if(pending) return <p>Loading...</p>

    return(
        <div className={style.main}>
            <div className={style.header}>
                <h2>ROOM: TBA</h2>
            </div>
            <div className={style.content}>
                <div className={style.messages}>
                    <div className={style.messagesContainer}>
                        {messages.length > 0 ? 
                            messages.map((message, index)=> <MessageItem key={index} message={message}/>)
                            : <p>No messages</p>
                        }
                    </div>
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
                </div>

                <div className={style.users}>
                    <h3>Users</h3>
                </div>   
            </div>
        </div>
    )
}