const clients_requests = [];
const admins = [];
const {
  CONVERSATION_RECEIVED_EVENTS,
  CONVERSATION_EMITTED_EVENTS,
} = require("../constants/ws-events");
const { broadcastAdmins } = require("./sse");
const { verifyToken } = require("../lib/jwt");

const get_users_waitings = () => {
  return clients_requests.map((client) => {
    const { lastName, firstName, id } = client.user;
    return { name: `${firstName} ${lastName}`, id };
  });
};
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
    if (admins.length === 0) {
      socket.emit(CONVERSATION_EMITTED_EVENTS.NO_ADMIN_AVAILABLE);
      socket.disconnect();
      return;
    }

    clients_requests.push(socket);
    broadcastAdmins({
      type: CONVERSATION_EMITTED_EVENTS.ADMINS_AVAILABLE,
      data: { message: "A user is requesting a conversation" },
    });
    const users_waiting = get_users_waitings();
    for (let admin of admins) {
      admin.emit(CONVERSATION_EMITTED_EVENTS.USERS_WAITING, { users_waiting });
    }
  }

  socket.on(CONVERSATION_RECEIVED_EVENTS.GET_USERS_WAITING, () => {
    if (!user.isAdmin) return;
    const users_waiting = get_users_waitings();
    socket.emit(CONVERSATION_EMITTED_EVENTS.USERS_WAITING, { users_waiting });
  });

  socket.on("disconnect", () => {
    if (user.isAdmin) {
      admins.splice(admins.indexOf(socket), 1);
    } else {
      clients_requests.splice(clients_requests.indexOf(socket), 1);
      console.log(
        "clients_requests",
        clients_requests.map((client) => client.user.id)
      );
      const users_waiting = get_users_waitings();
      for (let admin of admins) {
        admin.emit(CONVERSATION_EMITTED_EVENTS.USERS_WAITING, {
          users_waiting,
        });
      }
    }
  });
};
