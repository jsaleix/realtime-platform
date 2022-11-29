const { UniqueConstraintError } = require('sequelize');
const {verifyToken} = require("../lib/jwt");
const { ROOM_EMITTED_EVENTS, ROOM_RECEIVED_EVENTS, GLOBAL_EVENTS } = require("../constants/ws-events");
const { Room } = require("../models");

const clients = {};
let cache_validity = false;

let rooms = [
  {
    id: 1,
    displayName: "Room 1",
    users: [1,2],
    maxParticipants: 10,
  }
];

const DEFAULT_ROOM = "default";

const formatRooms = rooms => {
    return rooms.map((room) => {
        return {
            id: room.id,
            name: room.displayName,
            users: room.users.length,
            maxUsers: room.maxParticipants,
        };
    });
};

const sluggifyRoomName = (name) => {
    return name.toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
};

const translateDbRooms = (dbRooms) => {
  return dbRooms.map((room) => {
      let cachedRoom = rooms.find((cachedRoom) => cachedRoom.id === room.id);
      if(cachedRoom === undefined){
          return{
              id: room.id,
              displayName: room.displayName,
              users: [],
              maxParticipants: room.maxParticipants,
          };
      }
      return {
          id: room.id,
          displayName: room.displayName,
          users: cachedRoom.users,
          maxParticipants: room.maxParticipants,
      }
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
  
  socket.on( ROOM_RECEIVED_EVENTS.GET_ROOMS, async() => {
    if(!cache_validity){
        let dbRooms = await Room.findAll({where: {
            isClosed: false,
        }, raw: true});
        rooms = translateDbRooms(dbRooms);
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

  socket.on(ROOM_RECEIVED_EVENTS.CREATE_ROOM, async({displayName, maxParticipants}) => {
    if(!displayName || !maxParticipants) {
        socket.emit(ROOM_EMITTED_EVENTS.ROOM_CREATION_MISSING_PARAMETERS, "Missing parameters");
        return;
    }
    try{
        const roomSocketId =  sluggifyRoomName(displayName);
        const room = await Room.create({displayName, maxParticipants, socketId: roomSocketId});
        cache_validity = false;
        io.emit(ROOM_EMITTED_EVENTS.ROOM_CACHE_INVALIDATED);
        socket.emit(ROOM_EMITTED_EVENTS.ROOM_CREATED, room);
    }catch(err){
      if(err instanceof UniqueConstraintError){
        socket.emit(ROOM_EMITTED_EVENTS.ROOM_ALREADY_EXISTS);
      }else{
        console.log(err);
      }
    }
  });
};