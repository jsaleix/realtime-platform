import React from "react";
import style from "./room-item.module.scss";

export default function RoomItem({ room, onClick }) {
  return (
    <div className={style.main}>
      <h2>{room.name}</h2>
      <p>
        {room.users}/{room.maxUsers}
      </p>
      {room.users < room.maxUsers ? (
        <button className={"btn blue"} onClick={onClick}>
          Join
        </button>
      ) : (
        <button className={"btn blue"} disabled>
          Full
        </button>
      )}
    </div>
  );
}
