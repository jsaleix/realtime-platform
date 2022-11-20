exports.connection = require("./db");

exports.Conversation = require("./Conversation");
exports.User = require("./User");
exports.Message = require("./Message");
exports.Room = require('./Room');

exports.Message.belongsTo(exports.User, { foreignKey: 'sender'});
exports.User.hasMany(exports.Message, { foreignKey: 'sender'});

exports.Message.belongsTo(exports.Room);
exports.Room.hasMany(exports.Message);

exports.Conversation.belongsToMany(exports.User, { through: 'conversation_user' });
exports.User.belongsToMany(exports.Conversation, { through: 'conversation_user' });