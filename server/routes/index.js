const router = require( "express" ).Router();

router.use('/message', require('./message'));
router.use('/notification', require('./notification'));
router.use('/security', require('./security'));
router.use('/user', require('./user'));
router.get('/', (req, res) => { return res.status(200).json({ message: "Welcome to the API hotreload" }) });

module.exports = router;