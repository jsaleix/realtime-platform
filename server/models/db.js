const Sequelize = require("sequelize");

const connection = new Sequelize(process.env.DATABASE_URL, {
  	useNewUrlParser: true,
	logging: false,
});

connection
	.authenticate()
	.then(() => {
		console.log("Connection has been established successfully.");
	})
	.catch((err) => {
		console.error("Unable to connect to the database:", err);
	});

module.exports = connection;
