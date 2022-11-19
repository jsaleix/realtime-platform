const jwt = require("jsonwebtoken");

const blacklist = [];

exports.createToken = (user) => {
	const payload = {
		id: user.id,
		firstName: user.firstName,
		lastName: user.lastName,
		isAdmin: user.isAdmin,
		email: user.email,
	};
	return jwt.sign(payload, process.env.JWT_SECRET, {
		expiresIn: "1y",
		algorithm: "HS512",
	});
};

exports.verifyToken = (token) => {
	try {
		if(blacklist.includes(token)){
			return null;
		}
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		return {
			id: decoded.id,
			firstName: decoded.firstName,
			lastName: decoded.lastName,
			isAdmin: decoded.isAdmin,
		};
	} catch (error) {
		return null;
	}
};

exports.blacklistToken = (token) => {
	blacklist.push(token);
}
