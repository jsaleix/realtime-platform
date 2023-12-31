import React, { useEffect, useState, useCallback, useRef } from "react";
import { useAppContext } from "../../contexts/app-context";
import { useSocketContext } from "../../contexts/socket-context";
import {
    ROOM_EMITTED_EVENTS,
    ROOM_RECEIVED_EVENTS,
} from "../../constants/wss-events";
import MessageItem from "../message-item/message-item";
import style from "./channel.module.scss";
import ChatBox from "../chat-box";

export default function Channel({ roomId }) {
    const { appState } = useAppContext();
    const { socket } = useSocketContext();
    const [messages, setMessages] = useState([]);
    const [pending, setPending] = useState(true);
    const [roomData, setRoomData] = useState({ name: "", users: [] });

    const sendMessage = useCallback(
        (input) => {
            socket.emit(ROOM_EMITTED_EVENTS.MESSAGE, {
                message: input,
                roomId,
            });
        },
        [socket, roomId]
    );

    useEffect(() => {
        if (!socket || !socket.id) return;
        console.log(socket);
        socket.on(ROOM_RECEIVED_EVENTS.INIT_MESSAGES, ({ messages }) => {
            console.log(messages);
            setMessages(messages);
        });

        socket.on(ROOM_RECEIVED_EVENTS.NEW_MESSAGE, (message) => {
            setMessages((msges) => [...msges, message]);
        });

        socket.on(ROOM_RECEIVED_EVENTS.ROOM_UPDATED, (data) => {
            console.log("updated", data);
            setRoomData(data);
        });

        socket.on(ROOM_RECEIVED_EVENTS.USER_LEFT, ({username}) => {
            console.log("left")
            const leftMsg = {
                message: `User #${username} left the room`,
                username: "System",
            }
            setMessages((msges) => [...msges, leftMsg]);
        })

        socket.on(ROOM_RECEIVED_EVENTS.CURRENT_USER_JOINED, (roomId) => {
            console.log("okn,aek,apodea,ozd");
            console.log("You joined room", roomId);
            setPending(false);
        });

        return () => {
            setMessages([]);
            console.log("deleted");
            socket.off(ROOM_RECEIVED_EVENTS.USER_LEFT);
            socket.off(ROOM_RECEIVED_EVENTS.INIT_MESSAGES);
            socket.off(ROOM_RECEIVED_EVENTS.NEW_MESSAGE);
            socket.off(ROOM_RECEIVED_EVENTS.ROOM_UPDATED);
            socket.off(ROOM_RECEIVED_EVENTS.CURRENT_USER_JOINED);
        };
    }, [roomId]);

    if (pending) return <p>Loading...</p>;

    return (
        <div className={style.main}>
            <div className={style.header}>
                <h2>ROOM: {roomData.name}</h2>
            </div>
            <div className={style.content}>
                <ChatBox messages={messages} onSendMessage={sendMessage} />

                <div className={style.users}>
                    <h3>Users</h3>
                    <ul>
                        {roomData.users.length > 0 &&
                            roomData.users.map((user, index) => (
                                <li key={index}>{user}</li>
                            ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
