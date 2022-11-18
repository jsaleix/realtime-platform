const { Router } = require("express");
const { MessageController } = require("../controller");
const { verifyToken } = require("../middlewares/auth");

const router = new Router();

// router.get('/user', verifyToken, MessageController.getConversations);

// router.route('/user/:userId')
//     .post(verifyToken, MessageController.sendMessage)
//     .get(verifyToken, MessageController.getMessages);

module.exports = router;