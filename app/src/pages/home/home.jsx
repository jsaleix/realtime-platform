import React, { useEffect, useState, useCallback } from "react";
import Channel from "../../components/channel/channel";
import { io } from "socket.io-client";
import { useAppContext } from "../../contexts/app-context";
import RoomItem from "../../components/room-item/room-item";
import { ROOM_EMITTED_EVENTS, ROOM_RECEIVED_EVENTS } from "../../constants/wss-events";
import style from "./home.module.scss";
import { useSocketContext } from "../../contexts/socket-context";
import ChatBotCta from "../../components/chatbot-cta";
import ConversationCta from "../../components/conversation-cta";

export default function Home() {
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
    socket.off(ROOM_RECEIVED_EVENTS.USER_JOINED);
    socket.off(ROOM_RECEIVED_EVENTS.USER_LEFT);
    socket.off(ROOM_RECEIVED_EVENTS.DISCONNECT);
    console.log("%cremoved listeners%s", "color: green");
  }, [socket]);

  const setListeners = useCallback(() => {
    if(socketSetup){
      console.log("socket already setup");
      return;
    }
    console.log("%cListeners set %s", "color: red")
    openSocket();

    socket.on("connect", () => {
      console.log("CALLED")
      socket.emit(ROOM_EMITTED_EVENTS.GET_ROOMS);
    });

    socket.on(ROOM_RECEIVED_EVENTS.ROOM_CACHE_INVALIDATED, () => {
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

  }, [socket, socketSetup]);

  useEffect(() => {
    setPending(true);
    if (!socket.connected) return;
    socket.emit(ROOM_EMITTED_EVENTS.JOIN_ROOM, { roomId: selectedRoom });
  }, [selectedRoom]);

  useEffect(() => {
    if (!appState.auth.token) return;
    if( !socket?.connected && !socketSetup){
      setSocketSetup(true);
      setListeners();
    }

    return () => {
      removeListeners();
      setSocketSetup(false);
      closeSocket();
    };
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
                currentRoom={selectedRoom}
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
        : 
        <p>Please login to see the rooms</p>
      }
      <ChatBotCta/>
      <ConversationCta/>
    </div>
  );
}
