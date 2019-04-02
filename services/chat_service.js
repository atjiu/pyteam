const models = require('../models/models');
const config = require('../config');

let chat_model = models.chat_model;

exports.findAllWithPaginate = async (pageNo, group, beforeId, userId, targetUserId) => {
  let where = { group: group };
  if (group) {
    if (beforeId > 0) {
      where.beforeId = { $lt: beforeId };
    }
    // 查群组
    return await chat_model.findAll({
      include: [ { all: true } ],
      where: where,
      order: [ [ 'createdAt', 'DESC' ] ],
      offset: (pageNo - 1) * config.pageSize,
      limit: config.pageSize
    });
  } else {
    where.userId = { $or: [ userId, targetUserId ] };
    where.targetUserId = { $or: [ userId, targetUserId ] };
    if (beforeId > 0) {
      where.beforeId = { $lt: beforeId };
    }
    // 查P2P
    return await chat_model.findAll({
      include: [ { all: true } ],
      where: where,
      order: [ [ 'createdAt', 'DESC' ] ],
      offset: (pageNo - 1) * config.pageSize,
      limit: config.pageSize
    });
  }
};

exports.create = async (content, userId, targetUserId, group, type) => {
  return await chat_model.create({
    content: content,
    userId: userId,
    targetUserId: targetUserId,
    group: group,
    type: type
  });
};

exports.findById = async (id) => {
  return await chat_model.findOne({ include: [ { all: true } ], where: { id: id } });
};
