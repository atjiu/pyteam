const models = require('../models/models');

let project_user_model = models.project_user_model;

exports.findByProjectId = async (projectId) => {
  return await project_user_model.findAll({ include: [ { all: true } ], where: { projectId: projectId } });
};
