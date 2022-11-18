const { createToken } = require("../lib/jwt");
const { User } = require("../models");
const { ValidationError } = require("sequelize");
const formatError = require("../lib/formatError");
const bcrypt =  require('bcryptjs');

exports.login = async (req, res, next) => {
    try {
		const user = await User.findOne({ where: { email: req.body.user.email } });
		if (!user) {
			return res.status(401).json({
				email: "Email not found",
			});
		}
		if ( !await bcrypt.compare( req.body.user.password, user.password )) {
			return res.status(401).json({
				password: "Password is incorrect",
			});
		}
		return res.status(200).json({
			token: createToken(user),
		});
    } catch (error) {
		console.error(error);
      	next();
    }
};

exports.register = async (req, res, next) => {
    try {
		const user = await User.create(req.body);
		return res.status(201).json(user);
    } catch (error) {
      	if (error instanceof ValidationError) {
			SpecificLogger(req, { 
				message:`${req.method} on '${req.originalUrl}' - ${JSON.stringify(formatError(error.errors))}`,
				level: log.levels.info
			});
			return res.status(422).json(formatError(error.errors));
      	} else {
			next();
      	}
    }
};