require('dotenv').config();
const cors = require("cors");
const express = require("express");
const mainRouter = require( "./routes" );

const app = express();

app.use(
	cors({
		origin: true,
		credentials: true
	})
)
app.use(express.json());
app.use(
	express.urlencoded({
		extended: true,
	})
);

app.use("/", mainRouter);

app.use((req, res, next) => {
    return res.sendStatus(500);
})

module.exports = app;