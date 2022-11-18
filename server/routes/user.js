const { Router } = require("express");
const { UserController } = require('../controller');
const { verifyToken, checkAdmin } = require('../middlewares/auth');

const router = new Router();

router.route('/')
    .get(verifyToken, checkAdmin, UserController.getUsers)

router.route('/self')
	.get(verifyToken, UserController.getSelf)

router.route('/:id')
	.get(verifyToken, UserController.getUser)

module.exports = router;
