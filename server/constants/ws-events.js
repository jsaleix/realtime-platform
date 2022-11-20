exports.GLOBAL_EVENTS = {
    CONNECT: "connect",
    DISCONNECT: "disconnect",
    ERROR: "error"
};

exports.ROOM_EMITTED_EVENTS = {
    USER_JOINED: "user_joined_room",
    CURRENT_USER_JOINED: "current_user_joined_room",
    USER_LEFT: "user_left_room",
    LEAVE_ROOM: "leave_room",
    NEW_MESSAGE: "room_new_message",
    LOAD_ROOMS: "load_rooms"
};

exports.ROOM_RECEIVED_EVENTS = {
    JOIN_ROOM: "join_room",
    LEAVE_ROOM: "leave_room",
    MESSAGE: "message_room",
    GET_ROOMS: "get_rooms",
    CREATE_ROOM: "create_room"
};
