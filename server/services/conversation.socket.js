const clients_requests = [];
const admins = [];
const { CONVERSATION_RECEIVED_EVENTS, CONVERSATION_EMITTED_EVENTS } = require("../constants/ws-events");

exports.conversationHandler = (io, socket) => {
    const token = socket.handshake.auth?.token;
    if(token){
        const user = verifyToken(token);
        if(user){
            socket.user = user;
        }
        if(user.isAdmin){
            //
        }
    }
};
