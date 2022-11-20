const {verifyToken} = require('../lib/jwt');
const { randomUUID} = require('crypto');
const { 
    broadcastAdmins,
    broadcastUsers,
    admins,
    users,
    clients 
} = require('../services/sse');

exports.getSSE = (req, res, next) => {
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

exports.sendNotification = async (req, res, next) => {
    const { message } = req.body;
    if(!message){
        return res.status(400).json({ message: "envoi un message zebi"});
    }
    broadcastUsers({type: "commerce", data: { message }});
    return res.status(201);
}