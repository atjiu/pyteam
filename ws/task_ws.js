const task_service = require("../services/task_service");
const project_user_service = require("../services/project_user_service");
const project_service = require("../services/project_service");
const result = require("../utils/result");
const config = require("../config");
const marked = require("../utils/marked");

// 查询个人参与的项目，推送给页面
exports.tasks = async (socket, projectId) => {
  // 查询与userId相关联的项目
  let tasks = await task_service.findByProjectId(projectId);
  socket.emit(
    "data",
    result(config.wsCode.TASKS, null, { projectId: projectId, tasks: tasks })
  );
};

exports.task = async (socket, taskId) => {
  let { task, task_dynamics, project_users } = await task_service.findById(
    taskId
  );
  task.intro = marked(task.intro);
  let attachments = await task_service.findAttachments(taskId);
  socket.emit(
    "data",
    result(config.wsCode.TASK, null, {
      task: task,
      task_dynamics: task_dynamics,
      project_users: project_users,
      attachments: attachments
    })
  );
};

// 创建项目
exports.createTask = async (
  io,
  socket_users,
  projectId,
  name,
  intro,
  deadline,
  creator,
  executor
) => {
  let task = await task_service.create(
    projectId,
    name,
    intro,
    deadline,
    creator,
    executor
  );
  await emitTaskData(io, socket_users, task.id);
};

// 更新任务状态
exports.updateStatus = async (io, socket_users, taskId, status, userId) => {
  await task_service.updateStatus(taskId, status, userId);
  await emitTaskData(io, socket_users, taskId);
};

exports.createTaskMessage = async (
  io,
  socket_users,
  taskId,
  content,
  mentionUserIds,
  userId
) => {
  await task_service.createTaskMessage(taskId, content, mentionUserIds, userId);
  await emitTaskData(io, socket_users, taskId);
};

exports.myTask = async (socket, userId) => {
  let myTasks = await task_service.findByExecutor(userId);
  socket.emit("data", {
    code: config.wsCode.MY_TASKS,
    detail: { tasks: myTasks }
  });
};

// 更新任务执行人
exports.changeTaskExecutorUser = async (
  io,
  socket_users,
  taskId,
  executorUser,
  userId
) => {
  await task_service.updateExecutorUser(taskId, executorUser, userId);
  await emitTaskData(io, socket_users, taskId);
};

// 更新任务标题
exports.updateTaskName = async (io, socket_users, taskId, name, userId) => {
  await task_service.updateName(taskId, name, userId);
  await emitTaskData(io, socket_users, taskId);
};

// 更新任务描述
exports.updateTaskIntro = async (io, socket_users, taskId, intro, userId) => {
  await task_service.updateIntro(taskId, intro, userId);
  await emitTaskData(io, socket_users, taskId);
};

// 给页面推送任务更新后的内容
async function emitTaskData(io, socket_users, taskId) {
  let { task, task_dynamics } = await task_service.findById(taskId);
  task.intro = marked(task.intro);
  let tasks = await task_service.findByProjectId(task.project.id);
  let project_users = await project_user_service.findByProjectId(
    task.projectId
  );
  // 参与当前任务所在项目的用户id
  let project_user_ids = await project_users.map(item => item.userId);
  // 筛选当前在线用户
  let waitEmitUsers = await socket_users.filter(
    item => project_user_ids.indexOf(parseInt(item.userId)) > -1
  );
  for (index in waitEmitUsers) {
    let userId = parseInt(waitEmitUsers[index].userId);
    let socketId = waitEmitUsers[index].socketId;
    let projects = await project_service.findByUserId(userId, "project");
    let myTasks = await task_service.findByExecutor(userId);
    let attachments = await task_service.findAttachments(taskId);
    io.to(socketId).emit(
      "data",
      result(config.wsCode.PROJECTS, null, { projects: projects })
    );
    io.to(socketId).emit(
      "data",
      result(config.wsCode.TASKS, null, {
        projectId: task.projectId,
        tasks: tasks
      })
    );
    io.to(socketId).emit(
      "data",
      result(config.wsCode.TASK, null, {
        task: task,
        task_dynamics: task_dynamics,
        attachments: attachments
      })
    );
    io.to(socketId).emit(
      "data",
      result(config.wsCode.MY_TASKS, null, { tasks: myTasks })
    );
  }
}
