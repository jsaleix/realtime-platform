const { Router } = require("express");
const { NotificationController } = require("../controller");
const { verifyToken, checkAdmin } = require('../middlewares/auth');

const router = new Router();

router.route('/')
    .get(NotificationController.getSSE)
    .post(verifyToken, checkAdmin, NotificationController.sendNotification);

module.exports = router;