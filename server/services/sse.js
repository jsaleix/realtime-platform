const admins = {};
const users = {};

const convertMessage = ({ type, ...data }) => {
    console.log(`event: ${type}\n` + `data: ${JSON.stringify(data)}\n\n`);
    return `event: ${type}\n` + `data: ${JSON.stringify(data)}\n\n`;
};

const broadcastAdmins = (message) => {
    if(Object.values(admins).length > 0){
        Object.values(admins).map((res) => {
            res.write(convertMessage(message));
        });
    }
}

const broadcastUsers = (message) => {
    if(Object.values(users).length > 0){
        Object.values(users).map((res) => {
            res.write(convertMessage(message));
        });
    }
}

const broadcastUser = (message, client_id) => {
    if(users[client_id]){
        users[client_id].write(convertMessage(message));
    }
}

module.exports = {
    convertMessage,
    broadcastAdmins,
    broadcastUsers,
    broadcastUser,
    admins,
    users
}