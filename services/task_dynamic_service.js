const models = require('../models/models');

let task_dynamic_model = models.task_dynamic_model;

exports.findAll = async (taskId) => {
  return await task_dynamic_model.findAll({ where: { taskId: taskId }, include: [ { all: true } ] });
};
