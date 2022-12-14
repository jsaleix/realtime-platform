const clients_requests = [];
const admins = [];
const {
  CONVERSATION_RECEIVED_EVENTS,
  CONVERSATION_EMITTED_EVENTS,
} = require("../constants/ws-events");
const { broadcastAdmins } = require("./sse");
const { verifyToken } = require("../lib/jwt");

exports.conversationHandler = (io, socket) => {
  //requires a authenticated user
  const token = socket.handshake.auth?.token;
  if (!token) {
    socket.disconnect();
    return;
  }
  const user = verifyToken(token);
  if (!user) {
    socket.disconnect();
    return;
  }
  socket.user = user;
  if (user.isAdmin) {
    admins.push(socket);
  } else {
    if (admins.length < 1) {
      socket.emit(CONVERSATION_EMITTED_EVENTS.NO_ADMIN_AVAILABLE);
      socket.disconnect();
      return;
    }

    clients_requests.push(socket);
    const admins_list = admins.map((admin) => {
      const { lastName, firstName } = admin.user;
      return `${firstName} ${lastName}`;
    });
    console.log("ON EST LA")
    broadcastAdmins({
      type: CONVERSATION_EMITTED_EVENTS.ADMINS_AVAILABLE,
      data: { message: "A user is requesting a conversation" },
    });
    socket.emit(CONVERSATION_EMITTED_EVENTS.ADMINS_AVAILABLE, { admins: admins_list });
  }
};
