const { User } = require("../models");

exports.getUsers = async (req, res, next) => {
    try {
		const { limit } = req.query;
		let users =null;
		if(typeof limit === "number" && limit > 0){
			users = await User.findAll({ 
				attributes: ["id", "email", "firstName", "lastName", "createdAt", "updatedAt"],
				order: [["createdAt", "DESC"]],
				limit: limit
			})
		}else {
			users = await User.findAll({ 
				attributes: ["id", "email", "firstName", "lastName", "createdAt", "updatedAt"],
				order: [["createdAt", "ASC"]]
			});
		}
		return res.json(users);
    } catch (error) {
		console.error(error);
      	next();
    }
};

exports.getUser = async (req, res, next) => {
    try {
		const user = await User.findByPk(req.params.id,
			{
				exclude: ["password"]
			}
		);
		if (!user) {
			return res.sendStatus(404);
		} else {
			return res.json(user);
		}
    } catch (error) {
     	next();
    }
};

exports.getSelf = async (req, res, next) => {
    try {
		const user = await User.findByPk(req.user.id, {
			attributes: {
				exclude: ["password", "isAdmin", "createdAt", "updatedAt"]
			}
		});
		if (!user) {
			return res.sendStatus(404);
		} else {
			return res.json(user);
		}
    } catch (error) {
		console.error(error);
     	next();
    }
};