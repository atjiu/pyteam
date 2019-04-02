const user_service = require('../services/user_service');
const result = require('../utils/result');
const config = require('../config');

exports.findAll = async (io, socket_users) => {
  let users = await user_service.findAll({ order: [ [ 'online', 'DESC' ] ] });
  for (let i = 0; i < socket_users.length; i++) {
    io
      .to(socket_users[i].socketId)
      .emit('data', result(config.wsCode.USERS, null, { users: users, userId: socket_users[i].userId }));
  }
};
