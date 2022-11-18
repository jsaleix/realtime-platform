exports.connection = require("./db");

exports.User = require("./User");
exports.Message = require("./Message");
exports.Room = require('./Room');

exports.Message.belongsTo(exports.User, { foreignKey: 'sender'});
exports.User.hasMany(exports.Message, { foreignKey: 'sender'});

exports.Message.belongsTo(exports.Room);
exports.Room.hasMany(exports.Message);