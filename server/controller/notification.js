const {verifyToken} = require('../lib/jwt');
const { randomUUID} = require('crypto');
const { 
    broadcastAdmins,
    broadcastAdmin,
    broadcastUsers,
    broadcastUser,
    admins,
    users
} = require('../services/sse');
const { CONVERSATION_EMITTED_EVENTS } = require('../constants/ws-events');

exports.getSSE = (req, res, next) => {
    try {
        let { client_id, token} = req.query;
        let user = null;
        if(!client_id){
            client_id = randomUUID();
        }
        user = verifyToken(token);
        if(user && user.isAdmin){
            admins[user.id] = res;
        } else {
            users[client_id] = res
        }

        res.on("close", () => {
            if(user){
                if(user && user.isAdmin){
                    delete admins[user.id];
                }else {
                    delete users[client_id];
                }
            }
        });
        
        const headers = {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
        };
        res.writeHead(200, headers);
        if(user && user.isAdmin){
            broadcastAdmin({type: 'connect', client_id}, user.id);
        }else{
            broadcastUser({type: 'connect', client_id}, client_id);
        }
    } catch(err){
        console.error(err);
        next();
    }
}

exports.disconnectSSE = (req, res, next) => {
    const user = req.user;
    if(user){
        if(users[user.id]){
            delete users[user.id];
        }
        if(admins[user.id]){
            delete admins[user.id];
        }
    }
    return res.sendStatus(200);
}

exports.sendNotification = async (req, res, next) => {
    const { message } = req.body;
    if(!message){
        return res.status(400).json({ message: "envoi un message zebi"});
    }
    broadcastUsers({type: "commerce",  message });
    return res.sendStatus(201);
}