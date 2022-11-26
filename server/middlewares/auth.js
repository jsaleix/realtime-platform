const { verifyToken, blacklistToken } = require("../lib/jwt");

exports.verifyToken = (req, res, next) => {
	const header = req.headers["authorization"];
	if (!header) {
		return res.sendStatus(401);
	}
	const [type, token] = header.split(/\s+/);
	if (type !== "Bearer") {
		return res.sendStatus(401);
	}
	const user = verifyToken(token);
	if (!user) {
		return res.sendStatus(401);
	}
	req.user = user;
	next();
};

exports.checkAdmin = (req, res, next) => {
	if (!req?.user?.isAdmin) {
		return res.sendStatus(403);
	} else {
		next();
	}
}

exports.blacklist = (req, res, next) => {
	const header = req.headers["authorization"];
	if (!header) {
		return res.sendStatus(401);
	}
	const [type, token] = header.split(/\s+/);
	if (type !== "Bearer") {
		return res.sendStatus(401);
	}
	blacklistToken(token);
	next();
}