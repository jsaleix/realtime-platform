const { Router } = require("express");
const { contactAdmin } = require("../controller/room");
// const { RoomController } = require("../controller");
const { verifyToken } = require('../middlewares/auth');

const router = new Router();

router.post('/contact-advisor', verifyToken, contactAdmin)
    

module.exports = router;