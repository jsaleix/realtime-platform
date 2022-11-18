// Create Room model using sequelize 
const { Model, DataTypes } = require("sequelize");
const connection = require("./db");
const { CONVERSATION_STATUS } = require("../constants/enums");

class Conversation extends Model{};

Conversation.init(
    {
        status: {
            type: DataTypes.ENUM(Object.keys(CONVERSATION_STATUS)),
            allowNull: false,
        }
    }, 
    {
        sequelize: connection,
        modelName: "conversation",
        paranoid: true,
    }
);

module.exports = Conversation;