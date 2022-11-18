// Create User model using sequelize
const { Model, DataTypes } = require("sequelize");
const connection = require("./db");
const bcryptjs = require("bcryptjs");

class User extends Model {}

User.init(
	{
		email: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
			validate: {
				isEmail: true,
			},
		},
		password: {
			type: DataTypes.STRING,
			allowNull: false,
			validate: {
				notEmpty: true,
			},
		},
		firstName:{
			type: DataTypes.STRING,
			allowNull: false,
			validate: {
				notEmpty: true,
			},
		},
		lastName: {
			type: DataTypes.STRING,
			allowNull: false,
			validate: {
				notEmpty: true,
			},
		},
		isAdmin: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false,
		},
	},
  	{
		sequelize: connection,
		modelName: "user",
		paranoid: true,
  	}
);

User.addHook("beforeCreate", async (user) => {
  	user.password = await bcryptjs.hash(user.password, await bcryptjs.genSalt());
});

module.exports = User;
