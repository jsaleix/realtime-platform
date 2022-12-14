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
    INIT_MESSAGES: "init_messages",
    NEW_MESSAGE: "room_new_message",
    LOAD_ROOMS: "load_rooms",
    ROOM_UPDATED: "room_updated",
    ROOM_CREATED: "room_created",
    ROOM_ALREADY_EXISTS: "room_already_exists",
    ROOM_CREATION_MISSING_PARAMETERS: "room_creation_missing_parameters",
    ROOM_CACHE_INVALIDATED: "room_cache_invalidated"
};

exports.ROOM_RECEIVED_EVENTS = {
    JOIN_ROOM: "join_room",
    LEAVE_ROOM: "leave_room",
    MESSAGE: "message_room",
    GET_ROOMS: "get_rooms",
    CREATE_ROOM: "create_room"
};

exports.CHATBOT_EMITTED_EVENTS = {
    CURRENT_WEEK_APPOINTMENTS: "current_week_appointments",
    NEXT_WEEK_APPOINTMENTS: "next_week_appointments",
    NO_AVAILABLE_APPOINTMENTS: "no_available_appointments",
    CONTACT_EMAIL: "contact_email",
    CONTACT_PHONE: "contact_phone",
    END: "end",
};

exports.CHATBOT_RECEIVED_EVENTS = {
    APPOINTMENT_DISPONIBILITY: "appointment_disponibility",
    CONVERSATION_CONTACT_EMAIL: "conversation_contact_email",
    CONVERSATION_CONTACT_PHONE: "conversation_contact_phone",
    END: "end",
};


exports.CONVERSATION_RECEIVED_EVENTS = {
    JOIN_CHANNEL: "conversation_join",
    LEAVE_CHANNEL: "conversation_leave",
    MESSAGE: "conversation_message",
}

exports.CONVERSATION_EMITTED_EVENTS = {
    USER_JOINED: "conversation_user_joined",
    NEW_MESSAGE: "conversation_new_message",
    USER_LEFT: "conversation_user_left",
    ADMINS_AVAILABLE: "conversation_admins_available",
    NO_ADMIN_AVAILABLE: "conversation_no_admin_available",
}