const project_service = require('../services/project_service');
const apidoc_service = require('../services/apidoc_service');
const project_user_service = require('../services/project_user_service');
const result = require('../utils/result');
const config = require('../config');

exports.findApidoc = async (socket, projectId) => {
  let { apidocs, project } = await apidoc_service.findByProjectId(projectId);
  socket.emit('data', { code: config.wsCode.APIDOC, detail: { apidocs: apidocs, project: project } });
};

exports.createApidoc = async (io, socket_users, name, method, path, returnContent, params, projectId, userId) => {
  await apidoc_service.create(name, method, path, returnContent, params, projectId, userId);
  emitApidocMessage(io, socket_users, projectId);
};

exports.deleteApidoc = async (io, socket_users, id, projectId) => {
  await apidoc_service.deleteById(id);
  emitApidocMessage(io, socket_users, projectId);
};

async function emitApidocMessage(io, socket_users, projectId) {
  let project_users = await project_user_service.findByProjectId(projectId);
  let project_user_ids = await project_users.map((item) => item.userId);
  let waitEmitUsers = await socket_users.filter((item) => project_user_ids.indexOf(parseInt(item.userId)) > -1);
  let { apidocs, project } = await apidoc_service.findByProjectId(projectId);
  for (index in waitEmitUsers) {
    let socketId = waitEmitUsers[index].socketId;
    io.to(socketId).emit('data', result(config.wsCode.APIDOC, null, { apidocs: apidocs, project: project }));
  }
}
