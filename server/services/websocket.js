const {verifyToken} = require("../lib/jwt");

const clients = {};
let cache_validity = true;

const rooms = [
  {
    id: 1,
    name: "Room 1",
    users: [],
    maxUsers: 10,
  },
  {
    id: 2,
    name: "Room 2",
    users: [],
    maxUsers: 10,
  },
];

const DEFAULT_ROOM = "default";

const EMITTED_EVENTS = {
    USER_JOINED: "user_joined",
    USER_LEFT: "user_left",
    LEAVE_ROOM: "leave_room",
    NEW_MESSAGE: "new_message",
    LOAD_ROOMS: "load_rooms",
};

const RECEIVED_EVENTS = {
    JOIN_ROOM: "join_room",
    LEAVE_ROOM: "leave_room",
    MESSAGE: "message",
    GET_ROOMS: "get_rooms",
    CREATE_ROOM: "create_room",
};

const formatRooms = (rooms) => {
    return rooms.map((room) => {
        return {
            id: room.id,
            name: room.name,
            users: room.users.length,
            maxUsers: room.maxUsers,
        };
    });
};

exports.websocketManager = (io, socket) => {
  const token = socket.handshake.auth.token;
  if (!token) socket.disconnect();

  //Check if the user is authenticated, if not disconnect
  let userId = verifyToken(token);
  if (!userId) socket.disconnect();
  userId = userId.id;

  //Saving user's socket id
  clients[userId] = socket.id;
  
  socket.on( RECEIVED_EVENTS.GET_ROOMS, () => {
    if(!cache_validity){
        //Get rooms from database
        //rooms = getRoomsFromDatabase();
        cache_validity = true;
    }

    socket.emit(
        EMITTED_EVENTS.LOAD_ROOMS,
        formatRooms(rooms)
      );
  });

  socket.on(RECEIVED_EVENTS.JOIN_ROOM, (roomId) => {
    //Checking if the room exists
    //...

    //Checking if user is already in a room
    //...

    socket.join(roomId);
    const toSend = {
        pastMsgs : [],
        users: []
    }
    socket.to(roomId).emit("user-connected", toSend);
  });

  socket.on(RECEIVED_EVENTS.JOIN_ROOM, ({roomId}) => {
    //Checking if the room exists
    //...
    const roomIdx = rooms.findIndex((room) => room.id === roomId);
    if(roomIdx === -1) return;

    //Checking if the room is full
    //...
    if(rooms[roomIdx].users.length === rooms[roomIdx].maxUsers) return;

    //Checking if user is already in a room
    //...
    const currentRoomId = rooms.findIndex((room) => room.users.includes(userId));
    if(currentRoomId !== -1){
        socket.leave(currentRoomId);
        socket.to(currentRoomId).emit(EMITTED_EVENTS.USER_LEFT, userId);
        rooms[currentRoomId].users = rooms[currentRoomId].users.filter((id) => id !== userId);
    }
    
    socket.join(roomId);
    
    rooms[roomIdx].users.push(userId);
    socket.to(roomId).emit(EMITTED_EVENTS.USER_JOINED, roomId);
    socket.emit(EMITTED_EVENTS.LOAD_ROOMS, formatRooms(rooms));
  });

  socket.on("leave-room", () => {
    //Checking if user is in a room
    //...
    const roomId = rooms.findIndex((room) => room.users.includes(userId));
    if(roomId === -1) return;

    //Removing user from room
    //...
    rooms = rooms.filter((room) => room.id !== roomId);
    socket.to(roomId).emit(EMITTED_EVENTS.USER_LEFT, userId);
    socket.emit(EMITTED_EVENTS.LOAD_ROOMS, formatRooms(rooms));

    //Move user to default room
  });

  socket.on("disconnect", () => {
    if (clients[userId]) {
      delete clients[userId];
      //Check if user is in a room
      const roomId = rooms.findIndex((room) => room.users.includes(userId));
        if(roomId !== -1){
            socket.to(roomId).emit(EMITTED_EVENTS.USER_LEFT, userId);
            rooms[roomId].users = rooms[roomId].users.filter((id) => id !== userId);
            socket.emit(EMITTED_EVENTS.LOAD_ROOMS, formatRooms(rooms));
        }
    }
  });

  socket.on("message", (data) => {
    //Checking if user is in the room
    //If so, emit message
    //Save message to database
    //io.to(roomId).emit('message', data);
  });

  socket.on("create-room", (data) => {
    //Check if room name is unique
    //If not, emit error

    //Create room
    //Save room to database
    //Join room
    //Emit invalide cache
  });


};