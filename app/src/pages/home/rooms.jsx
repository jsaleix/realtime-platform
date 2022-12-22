import React, { useEffect, useState, useCallback } from "react";
import Channel from "../../components/channel/channel";
import { useAppContext } from "../../contexts/app-context";
import { useSocketContext } from "../../contexts/socket-context";
import style from "./home.module.scss";
import {
    ROOM_EMITTED_EVENTS,
    ROOM_RECEIVED_EVENTS,
} from "../../constants/wss-events";
import RoomItem from "../../components/room-item/room-item";

const Rooms = () => {
    const { appState } = useAppContext();
    const { socket, closeSocket, openSocket } = useSocketContext();
    const [rooms, setRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [pending, setPending] = useState(false);
    const [socketSetup, setSocketSetup] = useState(false);

    const removeListeners = useCallback(() => {
        socket.off("connect");
        socket.off(ROOM_RECEIVED_EVENTS.ROOM_CACHE_INVALIDATED);
        socket.off(ROOM_RECEIVED_EVENTS.LOAD_ROOMS);
        socket.off(ROOM_RECEIVED_EVENTS.USER_LEFT);
        socket.off(ROOM_RECEIVED_EVENTS.DISCONNECT);
        console.log("%cremoved listeners%s", "color: green");
    }, [socket]);

    const setListeners = useCallback(() => {
        if (socketSetup) {
            console.log("socket already setup");
            return;
        }
        console.log("%cListeners set %s", "color: red");
        openSocket();

        socket.on("connect", () => {
            console.log("CALLED");
            socket.emit(ROOM_EMITTED_EVENTS.GET_ROOMS);
        });

        socket.on(ROOM_RECEIVED_EVENTS.ROOM_CACHE_INVALIDATED, () => {
            socket.emit(ROOM_EMITTED_EVENTS.GET_ROOMS);
        });

        socket.on(ROOM_RECEIVED_EVENTS.LOAD_ROOMS, (data) => {
            setRooms(data);
        });

        socket.on("connect_error", () => {
            console.log("%cAN ERROR OCCURRED WTFFF", "color: red");
        });

        socket.on(ROOM_RECEIVED_EVENTS.USER_LEFT, (data) => {
            console.log("A user has left the room", data);
        });

        socket.on(ROOM_RECEIVED_EVENTS.DISCONNECT, () => {
            console.log("disconnected");
        });
    }, [socket, socketSetup]);

    useEffect(() => {
        setPending(true);
        if (!socket.connected) return;
        socket.emit(ROOM_EMITTED_EVENTS.JOIN_ROOM, { roomId: selectedRoom });
    }, [selectedRoom]);

    useEffect(() => {
        if (!appState.auth.token) return;
        if (!socket?.connected && !socketSetup) {
            setSocketSetup(true);
            setListeners();
        }

        return () => {
            removeListeners();
            setSocketSetup(false);
            closeSocket();
        };
    }, [appState.auth.token]);

    return (
        <>
            <div className={style.rooms}>
                {rooms.map((room) => (
                    <RoomItem
                        currentRoom={selectedRoom}
                        key={room.id}
                        room={room}
                        onClick={() => setSelectedRoom(room.id)}
                    />
                ))}
            </div>
            <div className={style.channels}>
                {selectedRoom && (
                    <Channel roomId={selectedRoom} pending={pending} />
                )}
            </div>
        </>
    );
};

export default Rooms;
