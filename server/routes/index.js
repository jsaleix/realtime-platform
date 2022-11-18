const router = require( "express" ).Router();

router.use('/security', require('./security'));
router.use('/user', require('./user'));
router.use('/notification', require('./notification'));
router.use('/message', require('./message'));
router.use('/room', require('./room'));
router.get('/', (req, res) => { return res.status(200).json({ message: "Welcome to the API" }) });

module.exports = router;