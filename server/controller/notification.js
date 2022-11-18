const { User} = require('../models');
const { NOTIFICATION_TYPES} = require("../constants/enums");

const {verifyToken} = require('../lib/jwt');
const { randomUUID} = require('crypto');

const admins = {};
const users = {};

const convertMessage = ({ type, ...data }) => {
    console.log(`event: ${type}\n` + `data: ${JSON.stringify(data)}\n\n`);
    return `event: ${type}\n` + `data: ${JSON.stringify(data)}\n\n`;
};

const broadcastUsers = (message, client_id) => {
    if(users[client_id]){
        users[client_id].write(convertMessage(message));
    }
}

const broadcastAdmins = (message) => {
    if(Object.values(admins).length > 0){
        Object.values(admins).map((client_id, idx) => {
            if(users[client_id]){
                users[client_id].write(convertMessage(message))
            }
        });
    }
}


// TO UPDATE WITH ADMINS
// const sseWithAuth = (client_id, userId, isAdmin) => {
//     auth_users[userId] = client_id;
//     if(isAdmin){
//         admins[userId] = client_id;
//     }
//     if(users[auth_users[userId]]){
//         users[auth_users[userId]].write(convertMessage({type: 'auth'}));
//     }
// }

const getSSE = (req, res, next) => {
    try {
        let { client_id, token} = req.query;
        let user = null;
        if(!client_id){
            client_id = randomUUID();
        }
        if(token){
            user = verifyToken(req.query.token);
            if(!user || !user.id){
                res.sendStatus(404);
            }
            if(user.isAdmin){
                admins[user.id] = client_id;
            }
            auth_users[user.id] = client_id;
        }
        users[client_id] = res;

        res.on("close", () => {
            if(user){
                if(auth_users[user.id]){
                    delete auth_users[user.id];
                }
            }
            delete users[client_id];
        });
        
        const headers = {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
        };
        res.writeHead(200, headers);

        broadcastUsers({type: 'connect', client_id}, client_id);
    } catch(err){
        console.error(err);
        next();
    }
}

module.exports = {
    getSSE,
    broadcastUsers,
    broadcastAdmins
}