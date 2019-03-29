const models = require('../models/models');
const { sequelize } = require('../models/db');

let department_model = models.department_model,
  user_model = models.user_model;

exports.findAll = async (opt) => {
  return await department_model.findAll(opt);
};

exports.findById = async (id) => {
  return await department_model.findOne({ where: { id: id } });
};

exports.create = async (name) => {
  await department_model.create({ name: name });
};

exports.update = async (id, name, userCount) => {
  return await department_model.update({ name: name, userCount: userCount }, { where: { id: id } });
};

exports.deleteById = async (id) => {
  await sequelize.transaction({ autocommit: true }, async (t) => {
    // 先查询出当前部门的数据
    let department = await department_model.findOne({ where: { id: id }, transaction: t });
    // 清除用户表中当前部门的用户部门数据
    await user_model.update({ department: null }, { where: { department: department.name }, transaction: t });
    // 删除当前部门
    return await department_model.destroy({ where: { id: id }, transaction: t });
  });
};
