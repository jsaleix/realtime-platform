import React, { useEffect, useState, useCallback } from "react";
import Channel from "../../components/channel/channel";
import { io } from "socket.io-client";
import { useAppContext } from "../../contexts/app-context";
import RoomItem from "../../components/room-item/room-item";
import { EMITTED_EVENTS, RECEIVED_EVENTS } from "../../constants/wss-events";

export default function Home() {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const { appState } = useAppContext();
  const [socket, setSocket] = useState(null);

  const setupSocket = useCallback(() => {
    const { token } = appState.auth;
    const tmpSocket = io("ws://localhost:3000", {
      path: "/ws",
      auth: { token },
    });

    tmpSocket.on("connect", (rooms) => {
      console.log("connected", rooms);
      tmpSocket.emit("get_rooms");
    });

    tmpSocket.on(RECEIVED_EVENTS.LOAD_ROOMS, (data) => {
      console.log("rooms", data);
      setRooms(data);
    });

    tmpSocket.on(RECEIVED_EVENTS.USER_JOINED, (data) => {
      console.log("joined room", data);
      //setSelectedRoom(data);
    });

    tmpSocket.on("user-connected", (data) => {
      console.log("user connected", data);
    });

    tmpSocket.on("disconnect", () => {
      console.log("disconnected");
    });

    tmpSocket.on(RECEIVED_EVENTS.USER_JOINED, (data) => {
      console.log("joined room", data);
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
    if (!socket) return;
    socket.emit(EMITTED_EVENTS.JOIN_ROOM, { roomId: selectedRoom });
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
    <div className="home">
      <div className="container">
        <p>TEST</p>
        {rooms.map((room) => (
          <RoomItem
            key={room.id}
            room={room}
            onClick={() => setSelectedRoom(room.id)}
          />
        ))}
        {selectedRoom}
        {/* {selectedRoom && <Channel roomId={selectedRoom} />} */}
      </div>
    </div>
  );
}
