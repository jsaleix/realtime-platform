require('dotenv').config();
const cors = require("cors");
const express = require("express");
const { createServer } = require('http');
const {Server: WssServer} = require('socket.io');
const mainRouter = require( "./routes" );
const { websocketManager } = require('./services/websocket');

const app = express();
const httpServer = createServer(app);

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

const io = new WssServer(httpServer, {
	path: "/ws",
	cors: {
		origin: true,
	}
});

io.on('connection', socket => websocketManager(io, socket));

app.use("/", mainRouter);

app.use((req, res, next) => {
    return res.sendStatus(404);
})

module.exports = httpServer;