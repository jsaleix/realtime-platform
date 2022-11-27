import React, { useEffect, useState, useCallback } from "react";
import Channel from "../../components/channel/channel";
import { io } from "socket.io-client";
import { useAppContext } from "../../contexts/app-context";
import RoomItem from "../../components/room-item/room-item";
import { ROOM_EMITTED_EVENTS, ROOM_RECEIVED_EVENTS } from "../../constants/wss-events";
import style from "./home.module.scss";

export default function Home() {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const { appState } = useAppContext();
  const [socket, setSocket] = useState(null);
  const [pending, setPending] = useState(false);

  const setupSocket = useCallback(() => {
    const { token } = appState.auth;
    const tmpSocket = io("ws://localhost:3000", {
      path: "/ws",
      auth: { token },
    });

    tmpSocket.on("connect", (rooms) => {
      console.log("connected", rooms);
      tmpSocket.emit(ROOM_EMITTED_EVENTS.GET_ROOMS);
    });

    tmpSocket.on(ROOM_RECEIVED_EVENTS.LOAD_ROOMS, (data) => {
      console.log("rooms", data);
      setRooms(data);
    });

    tmpSocket.on(ROOM_RECEIVED_EVENTS.USER_JOINED, (data) => {
      console.log("A user has entered the room", data);
      //setSelectedRoom(data);
    });

    tmpSocket.on(ROOM_RECEIVED_EVENTS.USER_LEFT, (data) => {
      console.log("A user has left the room", data);
    });

    tmpSocket.on(ROOM_RECEIVED_EVENTS.DISCONNECT, () => {
      console.log("disconnected");
    });

    setSocket(tmpSocket);
  }, [socket]);
  

  const closeSocket = useCallback(() => {
    if (socket?.id) {
      socket.disconnect();
      setSocket(null);
    } else {
      console.log("no socket");
    }
  }, [socket]);

  useEffect(() => {
    setPending(true);
    if (!socket) return;
    socket.emit(ROOM_EMITTED_EVENTS.JOIN_ROOM, { roomId: selectedRoom });
  }, [selectedRoom]);

  useEffect(() => {
    closeSocket();
    if (!appState.auth.token) return;
    if (!socket?.id) setupSocket();
    () => closeSocket();
  }, [appState.auth.token]);

  useEffect(() => {
    document.title = "RealTime app";
  }, []);

  return (
    <div className={`${style.main} container`}>
      {appState.auth.token 
        ?
        <div className={style.rooms}>
          {rooms.map((room) => (
            <RoomItem
              key={room.id}
              room={room}
              onClick={() => setSelectedRoom(room.id)}
            />
            ))}
          </div>
        : <p>Please login to see the rooms</p>
      }
        
      <div className={style.channels}>
        {selectedRoom && <Channel roomId={selectedRoom} pending={pending} socket={socket} />}
      </div>
    </div>
  );
}
