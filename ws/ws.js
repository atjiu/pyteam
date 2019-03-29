const task_ws = require('./task_ws');
const project_ws = require('./project_ws');
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
    console.log('bind', JSON.stringify(socket_users));
    // 用户关闭浏览器后失去连接更新用户的状态
    socket.on('disconnect', async () => {
      let user = await user_servie.findBySocketId(socketId);
      if (user) {
        await remove(socket_users, { socketId: socketId });
        await user_servie.bind(user.id, false, null);
        console.log(`${user.username} 下线了!`);
        console.log('disconnect', JSON.stringify(socket_users));
      }
    });

    socket.on('data', async (result) => {
      console.log('data', JSON.stringify(socket_users));
      let socket_user = await find(socket_users, { socketId: socket.id });
      let payload = result.detail;
      let userId = socket_user.userId;
      console.log(`payload: ${JSON.stringify(result.detail)}`);
      if (result.code === config.wsCode.CREATE_PROJECT) {
        // create project
        project_ws.createProject(io, socket_users, payload.name, payload.intro, payload.joinUsers, userId);
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
        project_ws.myProjects(socket, userId);
      } else if (result.code === config.wsCode.UPDATE_STATUS) {
        task_ws.updateStatus(io, socket_users, payload.taskId, payload.status, userId);
      } else if (result.code === config.wsCode.UPDATE_PROJECT) {
        project_ws.updateProject(io, socket_users, payload.id, payload.name, payload.intro, payload.joinUsers, userId);
      } else if (result.code === config.wsCode.CREATE_TASK_MESSAGE) {
        task_ws.createTaskMessage(io, socket_users, payload.taskId, payload.content, payload.mentionUserIds, userId);
      } else if (result.code === config.wsCode.FETCH_MY_TASKS) {
        task_ws.myTask(socket, userId);
      }
    });
  });
};
