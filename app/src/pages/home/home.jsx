import React, { useEffect, useState, useCallback } from "react";
import Channel from "../../components/channel/channel";
import { io } from "socket.io-client";
import { useAppContext } from "../../contexts/app-context";
import RoomItem from "../../components/room-item/room-item";
import { ROOM_EMITTED_EVENTS, ROOM_RECEIVED_EVENTS } from "../../constants/wss-events";
import style from "./home.module.scss";
import { useSocketContext } from "../../contexts/socket-context";

export default function Home() {
  const { appState } = useAppContext();
  const { socket, closeSocket, openSocket } = useSocketContext();
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [pending, setPending] = useState(false);

  const setupSocket = useCallback(() => {
    openSocket();

    socket.on("connect", (rooms) => {
      socket.emit(ROOM_EMITTED_EVENTS.GET_ROOMS);
    });

    socket.on(ROOM_RECEIVED_EVENTS.LOAD_ROOMS, (data) => {
      console.log("rooms", data);
      setRooms(data);
    });

    socket.on(ROOM_RECEIVED_EVENTS.USER_JOINED, (data) => {
      console.log("A user has entered the room", data);
    });

    socket.on(ROOM_RECEIVED_EVENTS.USER_LEFT, (data) => {
      console.log("A user has left the room", data);
    });

    socket.on(ROOM_RECEIVED_EVENTS.DISCONNECT, () => {
      console.log("disconnected");
    });

  }, [socket]);

  useEffect(() => {
    setPending(true);
    if (!socket) return;
    socket.emit(ROOM_EMITTED_EVENTS.JOIN_ROOM, { roomId: selectedRoom });
  }, [selectedRoom]);

  useEffect(() => {
    if (!appState.auth.token) return;
    console.log(socket.connected)
    if (!socket?.connected) setupSocket();
    () => closeSocket();
  }, [appState.auth.token]);

  useEffect(() => {
    document.title = "RealTime app";
  }, []);

  return (
    <div className={`${style.main} container`}>
      {appState.auth.token 
        ?
        <>
          <div className={style.rooms}>
            {rooms.map((room) => (
              <RoomItem
                key={room.id}
                room={room}
                onClick={() => setSelectedRoom(room.id)}
              />
              ))}
            </div>
            <div className={style.channels}>
              {selectedRoom && <Channel roomId={selectedRoom} pending={pending}/>}
            </div>
        </>
        : <p>Please login to see the rooms</p>
      }
        
      
    </div>
  );
}
