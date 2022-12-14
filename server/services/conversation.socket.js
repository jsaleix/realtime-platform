const clients_requests = [];
const admins = [];
const current_conversations = [["a", "b"]];

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

const disconnect_client = (socket) => {
  console.log("CA A COMMENC2")
    socket.disconnect();
    const clientRequestIdx = clients_requests.indexOf(socket);

    if (clientRequestIdx !== -1) {
        clients_requests.splice(clientRequestIdx, 1);
        const users_waiting = get_users_waitings();
        for (let admin of admins) {
            admin.emit(CONVERSATION_EMITTED_EVENTS.USERS_WAITING, {
                users_waiting,
            });
        }
    } else {
        const conversation = current_conversations.find((conversation) =>
            conversation.includes(socket.user.id)
        );
        if (conversation) {
            const otherUser = conversation.find((id) => id !== socket.user.id);
            const otherUserSocket = clients_requests.find(
                (client) => client.user.id === otherUser
            );
            otherUserSocket.emit(CONVERSATION_EMITTED_EVENTS.USER_LEFT);
            current_conversations.splice(conversation, 1);
        }
    }
    console.log("USER DISCONNECTED")
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

    if (
        clients_requests.findIndex((client) => client.user.id === user.id) !==
            -1 ||
        current_conversations.indexOf((conversation) =>
            conversation.includes(user.id)
        ) !== -1
    ) {
      console.log("ACQUI")
        const old_socket = clients_requests.find(
            (client) => client.user.id === user.id
        );
        disconnect_client(old_socket);
    }else{
      console.log("YA PAS")
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
            admin.emit(CONVERSATION_EMITTED_EVENTS.USERS_WAITING, {
                users_waiting,
            });
        }
    }

    socket.on(CONVERSATION_RECEIVED_EVENTS.GET_USERS_WAITING, () => {
        if (!user.isAdmin) return;
        const users_waiting = get_users_waitings();
        socket.emit(CONVERSATION_EMITTED_EVENTS.USERS_WAITING, {
            users_waiting,
        });
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

    socket.on(CONVERSATION_RECEIVED_EVENTS.ACCEPTED_REQUEST, ({ user_id }) => {
        console.log("ACCEPTED", user_id);
        const user = clients_requests.find(
            (client) => client.user.id === user_id
        );
        if (!user) return;

        clients_requests.splice(clients_requests.indexOf(user), 1);
        socket.to(user.id).emit(CONVERSATION_EMITTED_EVENTS.REQUEST_ACCEPTED);
    });
};
