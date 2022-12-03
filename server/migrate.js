require('dotenv').config();
const { connection } = require("./models");
const sequelize_fixtures = require('sequelize-fixtures');

connection
  .sync({
    force: true,
  })
  .then(() => {
    console.log("Database synced");
    sequelize_fixtures.loadFile('./fixtures/data.json', connection.models).then(() => {
      console.log("Fixtures loaded")
      connection.close();
    });
  });

