const admins = {};
const users = {};
const clients = {};

const convertMessage = ({ type, ...data }) => {
    console.log(`event: ${type}\n` + `data: ${JSON.stringify(data)}\n\n`);
    return `event: ${type}\n` + `data: ${JSON.stringify(data)}\n\n`;
};

const broadcastAdmins = (message) => {
    if(Object.values(admins).length > 0){
        Object.values(admins).map((client_id) => {
            if(clients[client_id]){
                clients[client_id].write(convertMessage(message))
            }
        });
    }
}

const broadcastUsers = (message) => {
    if(Object.values(users).length > 0){
        Object.values(users).map((client_id) => {
            if(clients[client_id]){
                clients[client_id].write(convertMessage(message));
            }
        });
    }
}

module.exports = {
    convertMessage,
    broadcastAdmins,
    broadcastUsers,
    admins,
    users,
    clients
}