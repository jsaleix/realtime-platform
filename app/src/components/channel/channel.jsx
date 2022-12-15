import React, { useEffect, useState, useCallback, useRef } from "react";
import { useAppContext } from "../../contexts/app-context";
import { useSocketContext } from "../../contexts/socket-context";
import { ROOM_EMITTED_EVENTS, ROOM_RECEIVED_EVENTS } from "../../constants/wss-events";
import MessageItem from "../message-item/message-item";
import style from "./channel.module.scss";

export default function Channel({roomId}){
    const {appState} = useAppContext();
    const { socket } = useSocketContext();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [pending, setPending] = useState(true);
    const [roomData, setRoomData] = useState({name: "", users: []});
    const lastMsgRef = useRef(null);
    const msgContainerRef = useRef(null);

    const scrollToBottom = useCallback(()=> {
        if(lastMsgRef.current && msgContainerRef.current){
            const { offsetTop } = lastMsgRef.current;
            msgContainerRef.current.scrollTo({ top: offsetTop, behavior: 'smooth' });
        }
    }, [lastMsgRef, msgContainerRef]);

    const sendMessage = useCallback(() => {
        socket.emit(ROOM_EMITTED_EVENTS.MESSAGE, {message: input, roomId});
        setInput("");
    }, [socket, input, roomId]);

    useEffect(()=>{
        if(!socket || !socket.id ) return;
        console.log(socket)
        socket.on(ROOM_RECEIVED_EVENTS.INIT_MESSAGES, ({messages}) => {
            console.log(messages);
            setMessages(messages);
        })

        socket.on(ROOM_RECEIVED_EVENTS.NEW_MESSAGE, (message)=>{
            console.log("message", message);
            setMessages(msges => [...msges, message]);
        });

        socket.on(ROOM_RECEIVED_EVENTS.ROOM_UPDATED, (data)=>{
            console.log("updated", data);
            setRoomData(data);
        });

        socket.on(ROOM_RECEIVED_EVENTS.CURRENT_USER_JOINED, (roomId) => {
            console.log("okn,aek,apodea,ozd")
            console.log("You joined room", roomId);
            setPending(false);
        });

        return ()=>{
            setMessages([]);
            console.log("deleted")
            socket.off(ROOM_RECEIVED_EVENTS.INIT_MESSAGES);
            socket.off(ROOM_RECEIVED_EVENTS.NEW_MESSAGE);
            socket.off(ROOM_RECEIVED_EVENTS.ROOM_UPDATED);
            socket.off(ROOM_RECEIVED_EVENTS.CURRENT_USER_JOINED);
        }
    }, [roomId]);

    useEffect(()=>{
        scrollToBottom();
    }, [messages]);

    if(pending) return <p>Loading...</p>

    return(
        <div className={style.main}>
            <div className={style.header}>
                <h2>ROOM: {roomData.name}</h2>
            </div>
            <div className={style.content}>
                <div className={style.messages}>
                    <div className={style.messagesContainer} ref={msgContainerRef}>
                        {messages.length > 0 ?
                            <>
                                {messages.map((message, index)=> 
                                    <MessageItem key={index} message={message} displayUser={messages[index-1] === undefined || message.userId !== messages[index-1].userId}/>)
                                }
                                <div ref={lastMsgRef}/>
                            </>
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
                    <ul>
                        {roomData.users.length > 0 && roomData.users.map((user, index) => <li key={index}>{user}</li>)}
                    </ul>
                </div>   
            </div>
        </div>
    )
}