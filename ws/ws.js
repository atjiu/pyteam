const task_ws = require('./task_ws');
const project_ws = require('./project_ws');
const apidoc_ws = require('./apidoc_ws');
const user_ws = require('./user_ws');
const chat_ws = require('./chat_ws');
const user_servie = require('../services/user_service');
const result = require('../utils/result');
const config = require('../config');
const { remove, find } = require('lodash');

let socket_users = [];

module.exports = (io) => {
  io.on('connection', async (socket) => {
    let socketId = socket.id;
    let userId = socket.request._query['userId'];
    let username = socket.request._query['username'];
    console.log(`连接SocketID: ${socketId}, 连接用户：${username}`);
    socket_users.push({ socketId: socketId, userId: userId });
    await user_servie.bind(userId, true, socketId);
    socket.emit('message', result(config.errorCode.SUCCESS, '当前登录帐号与socket.io绑定成功', null));
    console.log(`${username} 上线了!`);
    // 给所有用户发送当前用户
    let users = await user_servie.findAll({ order: [ [ 'online', 'DESC' ] ] });
    io.emit('data', result(config.wsCode.USERS, null, { users: users, userId: userId }));
    // 用户关闭浏览器后失去连接更新用户的状态
    socket.on('disconnect', async () => {
      let user = await user_servie.findBySocketId(socketId);
      if (user) {
        await remove(socket_users, { socketId: socketId });
        await user_servie.bind(user.id, false, null);
        console.log(`${user.username} 下线了!`);
        // 给所有用户发送当前用户
        let users = await user_servie.findAll({ order: [ [ 'online', 'DESC' ] ] });
        io.emit('data', result(config.wsCode.USERS, null, { users: users, userId: 0 }));
      }
    });

    socket.on('data', async (result) => {
      let socket_user = await find(socket_users, { socketId: socket.id });
      let payload = result.detail;
      let userId = socket_user.userId;
      console.log(`payload: ${JSON.stringify(result.detail)}`);
      if (result.code === config.wsCode.CREATE_PROJECT) {
        // create project
        project_ws.createProject(
          io,
          socket_users,
          payload.name,
          payload.intro,
          payload.baseUrl,
          payload.joinUsers,
          payload.type,
          userId
        );
      } else if (result.code === config.wsCode.CREATE_TASK) {
        // create task
        task_ws.createTask(
          io,
          socket_users,
          payload.projectId,
          payload.name,
          payload.intro,
          payload.deadline,
          userId,
          payload.executor
        );
      } else if (result.code === config.wsCode.FETCH_TASKS) {
        task_ws.tasks(socket, payload.projectId);
      } else if (result.code === config.wsCode.FETCH_TASK) {
        task_ws.task(socket, payload.taskId);
      } else if (result.code === config.wsCode.FETCH_PROJECTS) {
        project_ws.myProjects(socket, payload.type, userId);
      } else if (result.code === config.wsCode.UPDATE_STATUS) {
        task_ws.updateStatus(io, socket_users, payload.taskId, payload.status, userId);
      } else if (result.code === config.wsCode.UPDATE_PROJECT) {
        project_ws.updateProject(
          io,
          socket_users,
          payload.id,
          payload.name,
          payload.intro,
          payload.baseUrl,
          payload.joinUsers,
          payload.type,
          userId
        );
      } else if (result.code === config.wsCode.CREATE_TASK_MESSAGE) {
        task_ws.createTaskMessage(io, socket_users, payload.taskId, payload.content, payload.mentionUserIds, userId);
      } else if (result.code === config.wsCode.FETCH_MY_TASKS) {
        task_ws.myTask(socket, userId);
      } else if (result.code === config.wsCode.FETCH_APIDOCS) {
        project_ws.myProjects(socket, payload.type, userId);
      } else if (result.code === config.wsCode.CREATE_PROJECT) {
        project_ws.createProject(
          io,
          socket_users,
          payload.name,
          payload.intro,
          payload.baseUrl,
          payload.joinUsers,
          payload.type,
          userId
        );
      } else if (result.code === config.wsCode.UPDATE_APIDOC) {
        project_ws.updateProject(
          io,
          socket_users,
          payload.id,
          payload.name,
          payload.intro,
          payload.baseUrl,
          payload.joinUsers,
          payload.type,
          userId
        );
      } else if (result.code === config.wsCode.CREATE_APIDOC) {
        apidoc_ws.createApidoc(
          io,
          socket_users,
          payload.name,
          payload.method,
          payload.path,
          payload.returnContent,
          payload.params,
          payload.projectId,
          userId
        );
      } else if (result.code === config.wsCode.FETCH_APIDOC) {
        apidoc_ws.findApidoc(socket, payload.projectId);
      } else if (result.code === config.wsCode.DELETE_APIDOC) {
        apidoc_ws.deleteApidoc(io, socket_users, payload.id, payload.projectId);
      } else if (result.code === config.wsCode.FETCH_USERS) {
        user_ws.findAll(io, socket_users);
      } else if (result.code === config.wsCode.FETCH_CHAT) {
        chat_ws.findChat(socket, payload.pageNo, payload.beforeId, payload.userId, payload.targetUserId);
      } else if (result.code === config.wsCode.CREATE_CHAT) {
        chat_ws.createChat(io, payload.content, userId, payload.targetUserId, payload.type);
      }
    });
  });
};
