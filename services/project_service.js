const models = require('../models/models');
const { sequelize } = require('../models/db');
const user_service = require('./user_service');

let project_model = models.project_model,
  task_model = models.task_model,
  project_user_model = models.project_user_model;

exports.findById = async (id) => {
  return await project_model.findOne({ include: [ { all: true } ], where: { id: id } });
};

exports.findByUserId = async (userId, type) => {
  let project_users = await project_user_model.findAll({ where: { userId: userId } });
  let projectIds = await project_users.map((pu) => pu.projectId);
  return await project_model.findAll({ include: [ { all: true } ], where: { id: projectIds, type: type } });
};

exports.create = async (name, intro, baseUrl, joinUsers, type, userId) => {
  // 开户事务，失败回滚
  await sequelize.transaction({ autocommit: true }, async (t) => {
    let user = await user_service.findById(userId);
    let project = await project_model.create(
      {
        name: name,
        intro: intro,
        creator: userId,
        type: type,
        baseUrl: baseUrl,
        departmentId: user.departmentId
      },
      { transaction: t }
    );
    for (index in joinUsers) {
      await project_user_model.create(
        {
          userId: joinUsers[index],
          projectId: project.id
        },
        { transaction: t }
      );
    }
  });
};

// -------------------------------------------------------------------------------------------------
exports.findAll = async (opt) => {
  opt.include = [ { all: true } ];
  return await project_model.findAll(opt);
};

exports.update = async (id, name, intro, baseUrl, userIds) => {
  // 开户事务，失败回滚
  await sequelize.transaction({ autocommit: true }, async (t) => {
    await project_model.update(
      {
        name: name,
        intro: intro,
        baseUrl: baseUrl
      },
      { where: { id: id }, transaction: t }
    );
    await project_user_model.destroy({ where: { projectId: id }, transaction: t });
    for (index in userIds) {
      await project_user_model.create(
        {
          userId: userIds[index],
          projectId: id
        },
        { transaction: t }
      );
    }
  });
};

exports.deleteById = async (id) => {
  await sequelize.transaction({ autocommit: true }, async (t) => {
    // 删除任务
    await task_model.destroy({ where: { projectId: id }, transaction: t });
    // 删除 project_user 关联表中的数据
    await project_user_model.destroy({ where: { projectId: id }, transaction: t });
    // 删除项目
    await project_model.destroy({ where: { id: id }, transaction: t });
  });
};
