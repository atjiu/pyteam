const chat_service = require('../services/chat_service');
const result = require('../utils/result');
const config = require('../config');

exports.findChat = async (socket, pageNo, beforeId, userId, targetUserId) => {
  let chats = await chat_service.findAllWithPaginate(pageNo, targetUserId == 0, beforeId, userId, targetUserId);
  socket.emit('data', result(config.wsCode.CHAT, null, { chats: chats, userId: userId, targetUserId: targetUserId }));
};

exports.createChat = async (io, content, userId, targetUserId, type) => {
  let chat = await chat_service.create(
    content,
    userId,
    targetUserId == 0 ? null : targetUserId,
    targetUserId == 0,
    type
  );
  chat = await chat_service.findById(chat.id);
  io.emit('data', result(config.wsCode.NEW_CHAT, null, { chat: chat, userId: userId, targetUserId: targetUserId }));
};
