const { Router } = require("express");
const { NotificationController, SecurityController } = require('../controller');
const { verifyToken, blacklist } = require('../middlewares/auth');

const router = new Router();

router.post("/login", SecurityController.login);

router.post("/register", SecurityController.register);

router.post('/logout', verifyToken, blacklist, NotificationController.disconnectSSE);

module.exports = router;
