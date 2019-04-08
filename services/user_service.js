const models = require('../models/models');
const { Sequelize, sequelize } = require('../models/db');
const uuid = require('uuid');
const file_util = require('../utils/file_util');

let user_model = models.user_model,
  department_model = models.department_model,
  project_user_model = models.project_user_model;

exports.login = async (username, password) => {
  return await user_model.findOne({ include: [ { all: true } ], where: { username: username, password: password } });
};

exports.register = async (username, password, departmentId) => {
  let user;
  // generator user avatar
  let avatar = await file_util.generatorAvatar(username, username.trim().substr(0, 1));
  await sequelize.transaction({ autocommit: true }, async (t) => {
    if (departmentId && departmentId !== '') {
      await department_model.update(
        { userCount: Sequelize.literal('userCount + 1') },
        { where: { id: departmentId }, transaction: t }
      );
    } else {
      departmentId = null;
    }
    user = await user_model.create(
      {
        username: username,
        password: password,
        departmentId: departmentId,
        avatar: avatar,
        token: uuid.v4()
      },
      { transaction: t }
    );
    user = await user_model.findOne({ include: [ { all: true } ], where: { id: user.id }, transaction: t });
  });
  return user;
};

exports.findById = async (id) => {
  return await user_model.findOne({ include: [ { all: true } ], where: { id: id } });
};

exports.findByUsername = async (username) => {
  return await user_model.findOne({ include: [ { all: true } ], where: { username: username } });
};

exports.findByToken = async (token) => {
  return await user_model.findOne({ include: [ { all: true } ], where: { token: token } });
};

exports.findBySocketId = async (socketId) => {
  return await user_model.findOne({ include: [ { all: true } ], where: { socketId: socketId } });
};

exports.bind = async (id, online, socketId) => {
  return await user_model.update({ online: online, socketId: socketId }, { where: { id: id } });
};

exports.findAll = async (opt) => {
  opt.include = [ { all: true } ];
  return await user_model.findAll(opt);
};

exports.findByDepartmentId = async (departmentId) => {
  return await user_model.findAll({ where: { departmentId: departmentId } });
};

// ---------------------------------------------------------------------------------------------------------

// admin edit user
exports.edit = async (id, username, password, departmentId) => {
  await sequelize.transaction({ autocommit: true }, async (t) => {
    // 查询用户当前的部门
    let user = await user_model.findOne({ include: [ { all: true } ], where: { id: id }, transaction: t });

    // 更新部门人数
    if (!user.department) {
      // 新的+1
      await department_model.update(
        { userCount: Sequelize.literal('userCount + 1') },
        { where: { id: departmentId }, transaction: t }
      );
    }
    if (user.department && user.department.id !== departmentId) {
      // 旧的-1
      await department_model.update(
        { userCount: Sequelize.literal('userCount - 1') },
        { where: { id: user.department.id }, transaction: t }
      );
      // 新的+1
      await department_model.update(
        { userCount: Sequelize.literal('userCount + 1') },
        { where: { id: departmentId }, transaction: t }
      );
    }

    // 更新用户信息
    let opt = { username: username, departmentId: departmentId };
    if (password.length > 0) {
      opt.password = password;
    }
    await user_model.update(opt, { where: { id: id }, transaction: t });
  });
};

exports.deleteById = async (id) => {
  await user_model.destroy({ where: { id: id } });
};

exports.findUsersByProjectId = async (projectId) => {
  let projectUsers = await project_user_model.findAll({ where: { projectId: projectId } });
  let userIds = await projectUsers.map((item) => item.userId);
  return await user_model.findAll({ where: { id: userIds } });
};
