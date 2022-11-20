const {verifyToken} = require("./jwt");

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
        rooms.map((room) => {
          return {
            id: room.id,
            name: room.name,
            users: room.users.length,
            maxUsers: room.maxUsers,
          };
        })
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

  socket.on("leave-room", () => {
    //Checking if user is in a room
    //...
    //Move user to default room
  });

  socket.on("disconnect", () => {
    if (clients[userId]) {
      delete clients[userId];
      //Check if user is in a room
      //If so, emit user-disconnected
      //socket.to(roomId).emit('user-left', userId);
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