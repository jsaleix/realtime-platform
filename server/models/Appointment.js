// Create Appointment model using sequelize 
const { Model, DataTypes } = require("sequelize");
const { APPOINTMENT_TYPE } = require("../constants/enums");
const connection = require("./db");

class Appointment extends Model{};

Appointment.init(
    {
        type: {
            type: DataTypes.ENUM(Object.keys(APPOINTMENT_TYPE)),
            allowNull: false,
        },
        date: {
            type: DataTypes.DATE,
            allowNull: false,
            unique: true,
        },
        duration: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        notes: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: null,
        },
    }, 
    {
        sequelize: connection,
        modelName: "appointment",
        paranoid: true,
    }
);

module.exports = Appointment;