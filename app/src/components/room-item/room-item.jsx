import React from "react";
import style from "./room-item.module.scss";

export default function RoomItem({ room, onClick, currentRoom }) {
  return (
    <div className={style.main}>
      <h2>{room.name}</h2>
      <div className={style.information}>
        <p>
          {room.users}/{room.maxUsers}
        </p>
        {room.users < room.maxUsers ? (
          currentRoom !== room.id ? (
            <button className={"btn blue"} onClick={onClick}>Join</button>)
            : (<button className={"btn disabled"} disabled >Join</button>)
        ) : (
          <button className={"btn blue"} disabled>
            Full
          </button>
        )}
      </div>
    </div>
  );
}
