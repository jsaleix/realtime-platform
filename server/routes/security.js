const { Router } = require("express");
const { SecurityController } = require('../controller');
const { verifyToken, blacklist } = require('../middlewares/auth');

const router = new Router();

router.post("/login", SecurityController.login);

router.post("/register", SecurityController.register);

router.post('/logout', verifyToken, blacklist);

module.exports = router;
