const models = require('../models/models');
const project_service = require('./project_service');
const project_user_service = require('./project_user_service');

let apidoc_model = models.apidoc_model;

exports.findByProjectId = async (projectId) => {
  let project = await project_service.findById(projectId);
  let apidocs = await apidoc_model.findAll({ include: [ { all: true } ], where: { projectId: projectId } });
  return { project, apidocs };
};

exports.create = async (name, method, path, returnContent, params, projectId, userId) => {
  await apidoc_model.create({
    name: name,
    method: method,
    path: path,
    returnContent: returnContent,
    userId: userId,
    params: JSON.stringify(params),
    projectId: projectId
  });
};

exports.deleteById = async (id) => {
  await apidoc_model.destroy({ where: { id: id } });
};
