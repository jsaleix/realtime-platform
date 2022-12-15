const clients_requests = [];
const admins = [];
const current_conversations = [["a", "b"]];

const {
    CONVERSATION_RECEIVED_EVENTS,
    CONVERSATION_EMITTED_EVENTS,
} = require("../constants/ws-events");
const { broadcastAdmins } = require("./sse");
const { wsJwtVerify } = require("./utils/middleware");

const get_users_waitings = () => {
    return clients_requests.map((client) => {
        const { lastName, firstName, id } = client.user;
        return { name: `${firstName} ${lastName}`, id };
    });
};

const disconnect_client = (socket) => {
    console.log("CA A COMMENC2");
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
    console.log("USER DISCONNECTED");
};

const singletonMiddleware = (socket, next) => {
    if (
        clients_requests.findIndex((client) => client.user.id === socket.user.id) !==
            -1 ||
        current_conversations.indexOf((conversation) =>
            conversation.includes(socket.user.id)
        ) !== -1
    ) {
        const old_socket = clients_requests.find(
            (client) => client.user.id === socket.user.id
        );
        disconnect_client(old_socket);
    }
    next();
};

const connectionLoadBalancer = (socket, next) => {
    if (socket.user.isAdmin) {
        admins.push(socket);
    } else {
        console.log('il rentre pas dans le else');
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
    next();
};

exports.conversationHandler = (io) => {
    io.of("/conversation").use(wsJwtVerify);
    io.of("/conversation").use(singletonMiddleware);
    io.of("/conversation").use(connectionLoadBalancer);

    io.of("/conversation").on("connection", (socket) => {
        socket.on(CONVERSATION_RECEIVED_EVENTS.GET_USERS_WAITING, () => {
            if (!socket.user.isAdmin) return;
            const users_waiting = get_users_waitings();
            socket.emit(CONVERSATION_EMITTED_EVENTS.USERS_WAITING, {
                users_waiting,
            });
        });

        socket.on("disconnect", () => {
            if (socket.user.isAdmin) {
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

        socket.on(CONVERSATION_RECEIVED_EVENTS.MESSAGE, (data) => {
            const conversation = current_conversations.find((conversation) =>
                conversation.includes(socket.user.id)
            );
            if (!conversation) return;
            const otherUser = conversation.find((id) => id !== socket.user.id);
            const otherUserSocket = clients_requests.find(
                (client) => client.user.id === otherUser
            );
        });
    });
};
