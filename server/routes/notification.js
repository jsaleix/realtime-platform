const { Router } = require("express");
const { NotificationController } = require("../controller");
const { verifyToken } = require('../middlewares/auth');

const router = new Router();

router.route('/')
    .get(NotificationController.getSSE)

module.exports = router;