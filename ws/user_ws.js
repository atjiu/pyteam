const user_service = require('../services/user_service');
const result = require('../utils/result');
const config = require('../config');

exports.findAll = async (io, socket_users, userId) => {
  let users = await user_service.findAll({});
  for (let i = 0; i < socket_users.length; i++) {
    io
      .to(socket_users[i].socketId)
      .emit('data', result(config.wsCode.USERS, null, { users: users, userId: socket_users[i].userId }));
  }
};
