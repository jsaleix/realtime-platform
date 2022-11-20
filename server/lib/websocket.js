const verifyToken = require('./jwt').verifyToken;

const clients = {};

exports.websocketManager = (io, socket) => {
    const token = socket.handshake.auth.token;
    const roomId = socket.handshake.auth.roomId;
    if( !token || !roomId ) socket.disconnect();

    let userId = verifyToken(token);
    if(!userId) socket.disconnect();
    userId = userId.id;

    clients[userId] = socket.id;
    socket.join(roomId);
    socket.to(roomId).emit('user-connected', `${userId} joined room ${roomId}`);

    socket.on('disconnect', () => {
        if(clients[userId]){
            delete clients[userId];
            socket.to(roomId).emit('user-left', userId);
        }
    });

    socket.on('message', (data) => {
        io.to(roomId).emit('message', data);
    });
    
};

