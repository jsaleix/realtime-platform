import React, { useEffect, useState, useCallback } from "react";
import Channel from "../../components/channel/channel";

const MOCK_ROOMS = [
  {
    id: 1,
    name: "Room 1",
  },
  {
    id: 2,
    name: "Room 2",
  },
];

export default function Home() {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);

  useEffect(() => {
    setRooms(MOCK_ROOMS);
    document.title = "RealTime app";
  }, []);

  return (
    <div className="home">
      <div className="container">
        <p>TEST</p>
        {rooms.map((room) => (
          <button onClick={() => setSelectedRoom(room.id)} key={room.id}>
            {room.name}
          </button>
        ))}
        {selectedRoom && <Channel roomId={selectedRoom} />}
      </div>
    </div>
  );
}
