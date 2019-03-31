const apidoc_service = require('../services/apidoc_service');
const project_service = require('../services/project_service');
const user_service = require('../services/user_service');

exports.index = async (ctx) => {
  let user = ctx.session.user;
  let projects = await project_service.findByUserId(user.id, 'apidoc');
  let users = await user_service.findByDepartmentId(user.departmentId);
  await ctx.render('apidoc', {
    page_title: '接口文档',
    projects: projects,
    users: users
  });
};

exports.detail = async (ctx) => {
  let user = ctx.session.user;
  const id = ctx.params.id;
  let project = await project_service.findById(id);
  let users = await user_service.findByDepartmentId(user.departmentId);
  let joinUsers = await user_service.findUsersByProjectId(id);
  await ctx.render('apidoc_detail', {
    page_title: '接口文档',
    project: project,
    joinUsers: joinUsers,
    users: users
  });
};
