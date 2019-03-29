const project_service = require('../services/project_service');
const project_user_service = require('../services/project_user_service');
const result = require('../utils/result');
const config = require('../config');
const { findIndex, map } = require('lodash');

// 查询个人参与的项目，推送给页面
exports.myProjects = async (socket, userId) => {
  // 查询与userId相关联的项目
  let projects = await project_service.findByUserId(userId);
  socket.emit('data', result(config.wsCode.PROJECTS, null, { projects: projects }));
};

// 创建项目
exports.createProject = async (io, socket_users, name, intro, joinUsers, userId) => {
  await project_service.create(name, intro, joinUsers, userId);
  emitProjectMessage(io, socket_users, joinUsers, [], userId);
};

// 更新项目
exports.updateProject = async (io, socket_users, id, name, intro, joinUsers, userId) => {
  // 先查出原来关联的用户
  let project_users = await project_user_service.findByProjectId(id);
  let oldUserIds = await project_users.map((item) => item.user.id.toString());
  await project_service.update(id, name, intro, joinUsers);
  emitProjectMessage(io, socket_users, joinUsers, oldUserIds, userId);
};

async function emitProjectMessage(io, socket_users, joinUsers, oldUserIds, userId) {
  // 将创建者也加入进来
  joinUsers.push(userId.toString());
  joinUsers = joinUsers.concat(oldUserIds);
  // 去重
  joinUsers = [ ...new Set(joinUsers) ];
  let waitEmitUsers = await socket_users.filter((item) => joinUsers.indexOf(item.userId) > -1);
  for (index in waitEmitUsers) {
    // 查询与userId相关联的项目
    let projects = await project_service.findByUserId(waitEmitUsers[index].userId);
    io.to(waitEmitUsers[index].socketId).emit('data', result(config.wsCode.PROJECTS, null, { projects: projects }));
  }
}
