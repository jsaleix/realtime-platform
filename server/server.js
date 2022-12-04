require('dotenv').config();
const cors = require("cors");
const express = require("express");
const { createServer } = require('http');
const {Server: WssServer} = require('socket.io');
const mainRouter = require( "./routes" );
const { channelHandler } = require('./services/channel.socket');
const { conversationHandler } = require('./services/conversation.socket');
const { chatbotHandler } = require('./services/chatbot.socket');

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

const channelIo = new WssServer(httpServer, {
	path: "/channel",
	cors: {
		origin: true,
	}
});

const conversationIo = new WssServer(httpServer, {
	path: "/conversation",
	cors: {
		origin: true,
	}
});

const chatbotIo = new WssServer(httpServer, {
	path: "/chatbot",
	cors: {
		origin: true,
	}
});

channelIo.on('connection', socket => channelHandler(channelIo, socket));
conversationIo.on('connection', socket => conversationHandler(conversationIo, socket));
chatbotIo.on('connection', socket => chatbotHandler(chatbotIo, socket));

app.use("/", mainRouter);

app.use((req, res, next) => {
    return res.sendStatus(404);
})

module.exports = httpServer;