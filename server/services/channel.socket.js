const { UniqueConstraintError, fn, col, Op } = require('sequelize');
const { ROOM_EMITTED_EVENTS, ROOM_RECEIVED_EVENTS, GLOBAL_EVENTS } = require("../constants/ws-events");
const { Room, Message, User } = require("../models");
const { verifyToken } = require("../lib/jwt");
const { wsJwtVerify } = require('./utils/middleware');

const clients = {};
let rooms = [];

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

const leaveRoom = (socket) => {
  const currentRoom = rooms.find((room) => room.users.includes(socket.user.id));

  if(currentRoom !== undefined){
      socket.leave(currentRoom.id);
      socket.to(currentRoom.id).emit(ROOM_EMITTED_EVENTS.USER_LEFT, socket.user.id);
      currentRoom.users = currentRoom.users.filter((id) => id !== socket.user.id);
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

const initRooms = async() => {
  let dbRooms = await Room.findAll({where: {
      isClosed: false,
  }, raw: true});
  rooms = translateDbRooms(dbRooms);
  return;
}

exports.channelHandler = (io) => {
  io.of('/channel').use((socket, next) => {
    console.log("ICI")
    next();
  });

  io.of('/channel').use(wsJwtVerify)
  io.of('/channel').on('connection', socket => {
    console.log("New client connected");

    //Saving user's socket id
    clients[socket.user.id] = socket.id;
    
    socket.on( ROOM_RECEIVED_EVENTS.GET_ROOMS, async() => {
      socket.emit(
          ROOM_EMITTED_EVENTS.LOAD_ROOMS,
          formatRooms(rooms)
        );
    });

    socket.on(ROOM_RECEIVED_EVENTS.JOIN_ROOM, async ({roomId}) => {
      //Checking if the room exists
      const roomIdx = rooms.findIndex((room) => room.id === roomId);
      if(roomIdx === -1) return;
      let messages = await Message.findAll({
        where: {
          roomId, 
        },
        include: [
          { model: User, attributes: ['id', 'firstName', 'lastName'] }
        ],
        order: [
          ['createdAt', 'ASC'],
        ],
      });
      messages = messages.map((message) => {
          return {
            message: message.content,
            userId: message.user.id,
            username: message.user.firstName + " " + message.user.lastName,
          }
      })


      //Checking if the room is full
      if(rooms[roomIdx].users.length === rooms[roomIdx].maxUsers) return;

      //Checking if user is already in a room, if so leave it
      leaveRoom(socket);
      console.log(`${socket.user.id} joined room ${roomId}`)
      socket.join(roomId);
      socket.emit(ROOM_EMITTED_EVENTS.INIT_MESSAGES, {messages});
      rooms[roomIdx].users.push(socket.user.id);
      socket.to(roomId).emit(ROOM_EMITTED_EVENTS.USER_JOINED, roomId);
      io.emit(ROOM_EMITTED_EVENTS.LOAD_ROOMS, formatRooms(rooms));
      
      //Sending room info to the current User
      setTimeout(() => {
        notifyRoomUpdated(io, roomId);
        console.log("NOTIFY ROOM UPDATED", socket.id);
        io.to(socket.id).emit(ROOM_EMITTED_EVENTS.CURRENT_USER_JOINED, roomId);
      }, 10000);
    });

    socket.on("leave-room", () => {
      //Checking if user is in a room
      //...
      const roomId = rooms.findIndex((room) => room.users.includes(socket.user.id));
      if(roomId === -1) return;

      //Removing user from room
      leaveRoom(socket);

      //Move user to default room
    });

    socket.on(GLOBAL_EVENTS.DISCONNECT, () => {
      console.log("Client disconnected");
      if (clients[socket.user.id]) {
        delete clients[socket.user.id];
        //Removing user from any potential room
        leaveRoom(socket);
      }
    });

    socket.on(ROOM_RECEIVED_EVENTS.MESSAGE, async ({message, roomId}) => {
      if(!roomId ||!message || message === "" ) return;
      const dbMessage = await Message.create({
          content: message,
          sender: socket.user.id,
          roomId,
      });
      console.log(dbMessage);
      //Checking if user is in the room
      if( rooms.find( room => room.users.includes(socket.user.id)) == -1 ) return;

      //If so, emit message
      io.in(roomId).emit(ROOM_EMITTED_EVENTS.NEW_MESSAGE, {message, userId: socket.user.id, username: `${user.firstName} ${user.lastName}`});
      
      //Save message to database
    });

    socket.on(ROOM_RECEIVED_EVENTS.CREATE_ROOM, async({displayName, maxParticipants}) => {
      if(!displayName || !maxParticipants) {
          socket.emit(ROOM_EMITTED_EVENTS.ROOM_CREATION_MISSING_PARAMETERS, "Missing parameters");
          return;
      }
      try{
          const roomSocketId = sluggifyRoomName(displayName);
          const room = await Room.create({displayName, maxParticipants, socketId: roomSocketId});
          rooms.push({
              id: room.id,
              displayName: room.displayName,
              users: [],
              maxParticipants: room.maxParticipants,
          });
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
  });
};

initRooms();