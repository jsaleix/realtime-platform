const {verifyToken} = require('../lib/jwt');
const { randomUUID} = require('crypto');

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
            } else {
                users[user.id] = client_id;
            }
        }
        clients[client_id] = res;

        res.on("close", () => {
            if(user){
                if(users[user.id]){
                    delete users[user.id];
                }
                if(admins[user.id]){
                    delete admins[user.id];
                }
            }
            delete clients[client_id];
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