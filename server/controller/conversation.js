const { broadcastAdmins, broadcastUsers } = require("./notification")

exports.askConversation = async(req, res, next) => {

    //traitement


    broadcastAdmins({type: 'new-conversation', data: { conversation }});
}