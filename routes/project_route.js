const project_service = require('../services/project_service');
const task_service = require('../services/task_service');
const user_service = require('../services/user_service');

exports.index = async (ctx) => {
  await ctx.render('project', {
    page_title: '项目'
  });
};

exports.detail = async (ctx) => {
  const id = ctx.params.id;
  let project = await project_service.findById(id);
  let tasks = await task_service.findByProjectId(id);
  let users = await user_service.findByDepartmentId(project.departmentId);
  let joinUsers = await user_service.findUsersByProjectId(id);
  await ctx.render('project', {
    page_title: '项目',
    project: project,
    tasks: tasks,
    joinUsers: joinUsers,
    users: users
  });
};
