import React, { useEffect, useState } from "react";
import {
    CONVERSATION_BACK_EVENTS,
    CONVERSATION_FRONT_EVENTS,
} from "../../../constants/wss-events";
import style from "./index.module.scss";

const Requests = ({ socket, handleRequest }) => {
    const [requests, setRequests] = useState([]);

    useEffect(() => {
        if (!socket) {
            return;
        }
        socket.emit(CONVERSATION_FRONT_EVENTS.GET_USERS_WAITING_ADMIN);

        socket.on("connect_error", () => {
            console.log("connect_error");
        });

        socket.on(
            CONVERSATION_BACK_EVENTS.USERS_WAITING,
            ({ users_waiting }) => {
                setRequests(users_waiting);
            }
        );

        return () => {
            socket.off(CONVERSATION_BACK_EVENTS.USERS_WAITING);
        };
    }, [socket]);

    return (
        <div className={style.requests}>
            <h2>Requests</h2>
            {requests.length > 0 ? (
                requests.map((item, index) => (
                    <div key={index} className={style.request}>
                        <p>{item.name}</p>
                        <button
                            onClick={() => handleRequest(requests[index].id)}
                            className={"btn blue"}
                        >
                            Handle this request
                        </button>
                    </div>
                ))
            ) : (
                <p>No requests</p>
            )}
        </div>
    );
};

export default Requests;
