const {verifyToken} = require("../../lib/jwt");
const { GLOBAL_EVENTS } = require('../../constants/ws-events');

const wsJwtVerify = (socket, next) => {
    try{
        const token = socket.handshake.auth.token;
        if (!token) throw new Error('Token not specified');
        const user = verifyToken(token);
        if (!user) throw new Error('Authentication error');
        socket.user = user;
        next();
    } catch(err){
        socket.emit(GLOBAL_EVENTS.CONNECTION_ERROR, err.message);
    }
}

module.exports = {
    wsJwtVerify,
}