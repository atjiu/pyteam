const { sequelize, Sequelize } = require("../models/db");
const models = require("../models/models");
const config = require("../config");
const moment = require("../utils/moment");
const task_dynamic_service = require("./task_dynamic_service");
const project_user_service = require("./project_user_service");
const user_service = require("./user_service");
const fs = require("fs");

let task_model = models.task_model,
  project_model = models.project_model,
  task_dynamic_model = models.task_dynamic_model;

exports.findById = async id => {
  let task = await task_model.findOne({
    include: [{ all: true }],
    where: { id: id }
  });
  let task_dynamics = await task_dynamic_service.findAll(id);
  // 查询当前任务所属项目的参与用户
  let project_users = await project_user_service.findByProjectId(
    task.project.id
  );
  return {
    task: task,
    task_dynamics: task_dynamics,
    project_users: project_users
  };
};

exports.findByProjectId = async projectId => {
  return await task_model.findAll({
    include: [{ all: true }],
    where: { projectId: projectId }
  });
};

exports.create = async (
  projectId,
  name,
  intro,
  deadline,
  creator,
  executor
) => {
  let task;
  await sequelize.transaction({ autocommit: true }, async t => {
    let _deadline = deadline ? moment(deadline).toDate() : null;
    // 创建任务
    task = await task_model.create(
      {
        creator: creator,
        executor: executor,
        projectId: projectId,
        name: name,
        intro: intro,
        deadline: _deadline,
        status: config.taskStatus.WAIT
      },
      { transaction: t }
    );
    // 项目的任务数+1
    await project_model.update(
      { taskCount: Sequelize.literal("taskCount + 1") },
      { where: { id: projectId }, transaction: t }
    );
    // 创建任务动态
    await task_dynamic_model.create(
      { content: "创建任务", taskId: task.id, userId: creator },
      { transaction: t }
    );
  });
  return task;
};

exports.updateStatus = async (taskId, status, userId) => {
  await sequelize.transaction({ autocommit: true }, async t => {
    await task_model.update(
      { status: status },
      { where: { id: taskId }, transaction: t }
    );
    // 创建任务动态
    await task_dynamic_model.create(
      { content: `更新任务状态为${status}`, taskId: taskId, userId: userId },
      { transaction: t }
    );
  });
};

exports.updateExecutorUser = async (taskId, executorUser, userId) => {
  await sequelize.transaction({ autocommit: true }, async t => {
    let user = await user_service.findByUsername(executorUser);
    await task_model.update(
      { executor: user.id },
      { where: { id: taskId }, transaction: t }
    );
    // 创建任务动态
    await task_dynamic_model.create(
      {
        content: `更新任务执行人为${executorUser}`,
        taskId: taskId,
        userId: userId
      },
      { transaction: t }
    );
  });
};

// 更新任务名
exports.updateName = async (taskId, name, userId) => {
  await sequelize.transaction({ autocommit: true }, async t => {
    await task_model.update(
      { name: name },
      { where: { id: taskId }, transaction: t }
    );
    // 创建任务动态
    await task_dynamic_model.create(
      {
        content: `更新任务标题为${name}`,
        taskId: taskId,
        userId: userId
      },
      { transaction: t }
    );
  });
};

// 更新任务描述
exports.updateIntro = async (taskId, intro, userId) => {
  await sequelize.transaction({ autocommit: true }, async t => {
    await task_model.update(
      { intro: intro },
      { where: { id: taskId }, transaction: t }
    );
    // 创建任务动态
    await task_dynamic_model.create(
      {
        content: `更新任务描述为${intro}`,
        taskId: taskId,
        userId: userId
      },
      { transaction: t }
    );
  });
};

exports.createTaskMessage = async (taskId, content, mentionUserIds, userId) => {
  await sequelize.transaction({ autocommit: true }, async t => {
    // 创建任务动态
    await task_dynamic_model.create(
      { content: `${content}`, taskId: taskId, userId: userId },
      { transaction: t }
    );
    // TODO 通过 mentionUserIds 给被@的用户发消息通知
  });
};

exports.findByExecutor = async userId => {
  return await task_model.findAll({
    include: [{ all: true }],
    where: { executor: userId }
  });
};

exports.findAttachments = async taskId => {
  // 查找任务的附件
  if (fs.existsSync(`${config.attachment_dir}/task/${taskId}`)) {
    let attachmentFiles = await fs.readdirSync(
      `${config.attachment_dir}/task/${taskId}`
    );
    return await attachmentFiles.map(item => {
      return {
        name: item,
        ext: item.split(".").pop(),
        url: `${config.base_url}/attachments/task/${taskId}/${item}`
      };
    });
  } else {
    return [];
  }
};
