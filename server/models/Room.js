// Create Room model using sequelize 
const { Model, DataTypes } = require("sequelize");
const connection = require("./db");

class Room extends Model{};

Room.init(
    {
        displayName: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        socketId: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        maxParticipants: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 2,
        },
        isClosed: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
    }, 
    {
        sequelize: connection,
        modelName: "room",
        paranoid: true,
    }
);

module.exports = Room;