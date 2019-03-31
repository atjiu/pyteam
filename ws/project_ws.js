const project_service = require('../services/project_service');
const project_user_service = require('../services/project_user_service');
const result = require('../utils/result');
const config = require('../config');

// 查询个人参与的项目，推送给页面
exports.myProjects = async (socket, type, userId) => {
  // 查询与userId相关联的项目
  let projects = await project_service.findByUserId(userId, type);
  if (type === 'project') {
    socket.emit('data', result(config.wsCode.PROJECTS, null, { projects: projects }));
  } else if (type === 'apidoc') {
    socket.emit('data', result(config.wsCode.APIDOCS, null, { projects: projects }));
  }
};

// 创建项目
exports.createProject = async (io, socket_users, name, intro, baseUrl, joinUsers, type, userId) => {
  await project_service.create(name, intro, baseUrl, joinUsers, type, userId);
  emitProjectMessage(io, socket_users, joinUsers, [], userId, type);
};

// 更新项目
exports.updateProject = async (io, socket_users, id, name, intro, baseUrl, joinUsers, type, userId) => {
  // 先查出原来关联的用户
  let project_users = await project_user_service.findByProjectId(id);
  let oldUserIds = await project_users.map((item) => item.user.id.toString());
  await project_service.update(id, name, intro, baseUrl, joinUsers);
  console.log('updateproject', type);
  emitProjectMessage(io, socket_users, joinUsers, oldUserIds, userId, type);
};

async function emitProjectMessage(io, socket_users, joinUsers, oldUserIds, userId, type) {
  // 将创建者也加入进来
  joinUsers.push(userId.toString());
  joinUsers = joinUsers.concat(oldUserIds);
  // 去重
  joinUsers = [ ...new Set(joinUsers) ];
  let waitEmitUsers = await socket_users.filter((item) => joinUsers.indexOf(item.userId) > -1);
  for (index in waitEmitUsers) {
    // 查询与userId相关联的项目
    let projects = await project_service.findByUserId(waitEmitUsers[index].userId, type);
    if (type === 'project') {
      io.to(waitEmitUsers[index].socketId).emit('data', result(config.wsCode.PROJECTS, null, { projects: projects }));
    } else if (type === 'apidoc') {
      io.to(waitEmitUsers[index].socketId).emit('data', result(config.wsCode.APIDOCS, null, { projects: projects }));
    }
  }
}
