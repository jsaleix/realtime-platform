import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import {
  CONVERSATION_RECEIVED_EVENTS,
  CONVERSATION_EMITTED_EVENTS,
} from "../../../constants/wss-events";
import { useAppContext } from "../../../contexts/app-context";
import style from "./index.module.scss";

const Conversations = () => {
  const [socket, setSocket] = useState(null);
  const { appState } = useAppContext();
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const { token } = appState.auth;
    const tmpSocket = io("http://localhost:3000", {
      path: "/conversation",
      auth: { token },
    });
    setSocket(tmpSocket);
    tmpSocket.emit(CONVERSATION_EMITTED_EVENTS.GET_USERS_WAITING);

    tmpSocket.on(
      CONVERSATION_RECEIVED_EVENTS.USERS_WAITING,
      ({ users_waiting }) => {
        setRequests(users_waiting);
      }
    );

    return () => {
      console.log("disconnect");
      tmpSocket.close();
      tmpSocket.disconnect();
    };
  }, []);

  return (
    <div>
      <section>
        <div className="container">
          <div className={style.requests}>
            <h2>Requests</h2>
            {requests.length > 0 
              ? (requests.map((item, index) => (
                <div key={index} className={style.request}>
                  <p>{item.name}</p>
                  <button className={"btn blue"}>Handle this request</button>
                </div>
              )))
              : <p>No requests</p>
            }
          </div>
        </div>
      </section>
    </div>
  );
};

export default Conversations;
