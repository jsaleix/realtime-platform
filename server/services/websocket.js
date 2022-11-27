const {verifyToken} = require("../lib/jwt");
const { ROOM_EMITTED_EVENTS, ROOM_RECEIVED_EVENTS, GLOBAL_EVENTS } = require("../constants/ws-events");

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

const formatRooms = rooms => {
    return rooms.map((room) => {
        return {
            id: room.id,
            name: room.name,
            users: room.users.length,
            maxUsers: room.maxUsers,
        };
    });
};

const leaveRoom = (userId, socket) => {
  const currentRoom = rooms.find((room) => room.users.includes(userId));

  if(currentRoom !== undefined){
      socket.leave(currentRoom.id);
      socket.to(currentRoom.id).emit(ROOM_EMITTED_EVENTS.USER_LEFT, userId);
      currentRoom.users = currentRoom.users.filter((id) => id !== userId);
  }
};

const notifyRoomUpdated = (io, roomId) => {
  const room = rooms.find((room) => room.id === roomId);
  
  if(room === undefined) return;

  const infos = {
    roomId,
    name: room.name,
    users: room.users.map((id) => clients[id]),
  }

  io.to(roomId).emit(ROOM_EMITTED_EVENTS.ROOM_UPDATED, infos);
};

exports.websocketManager = (io, socket) => {
  console.log("New client connected");
  const token = socket.handshake.auth.token;
  if (!token) socket.disconnect();

  //Check if the user is authenticated, if not disconnect
  const user = verifyToken(token);
  if (!user) socket.disconnect();
  const userId = user.id;

  //Saving user's socket id
  clients[userId] = socket.id;
  
  socket.on( ROOM_RECEIVED_EVENTS.GET_ROOMS, () => {
    console.log("ROOMS REQUESTED");
    if(!cache_validity){
        //Get rooms from database
        //rooms = getRoomsFromDatabase();
        cache_validity = true;
    }

    socket.emit(
        ROOM_EMITTED_EVENTS.LOAD_ROOMS,
        formatRooms(rooms)
      );
  });

  socket.on(ROOM_RECEIVED_EVENTS.JOIN_ROOM, ({roomId}) => {
    //Checking if the room exists
    const roomIdx = rooms.findIndex((room) => room.id === roomId);
    if(roomIdx === -1) return;

    //Checking if the room is full
    if(rooms[roomIdx].users.length === rooms[roomIdx].maxUsers) return;

    //Checking if user is already in a room, if so leave it
    leaveRoom(userId, socket);
    
    socket.join(roomId);
    
    rooms[roomIdx].users.push(userId);
    socket.to(roomId).emit(ROOM_EMITTED_EVENTS.USER_JOINED, roomId);
    io.emit(ROOM_EMITTED_EVENTS.LOAD_ROOMS, formatRooms(rooms));

    //Sending room info to the current user
    notifyRoomUpdated(io, roomId);

    io.to(socket.id).emit(ROOM_EMITTED_EVENTS.CURRENT_USER_JOINED, roomId);
    console.log(`User ${userId} joined room ${roomId}`);
  });

  socket.on("leave-room", () => {
    //Checking if user is in a room
    //...
    const roomId = rooms.findIndex((room) => room.users.includes(userId));
    if(roomId === -1) return;

    //Removing user from room
    leaveRoom(userId, socket);

    //Move user to default room
  });

  socket.on(GLOBAL_EVENTS.DISCONNECT, () => {
    console.log("Client disconnected");
    if (clients[userId]) {
      delete clients[userId];
      //Removing user from any potential room
      leaveRoom(userId, socket);
    }
  });

  socket.on(ROOM_RECEIVED_EVENTS.MESSAGE, ({message, roomId}) => {
    if(!roomId ||!message || message === "" ) return;
    console.log(`User ${userId} sent message ${message} in room ${roomId}`);

    console.log(socket.rooms)
    //Checking if user is in the room
    if( rooms.find( room => room.users.includes(userId)) == -1 ) return;

    //If so, emit message
    io.in(roomId).emit(ROOM_EMITTED_EVENTS.NEW_MESSAGE, {message, userId, username: `${user.firstName} ${user.lastName}`});
    
    //Save message to database
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