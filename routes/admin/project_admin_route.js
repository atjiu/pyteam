const project_service = require('../../services/project_service');
const user_service = require('../../services/user_service');

exports.list = async (ctx) => {
  let projects = await project_service.findAll({});
  await ctx.render('admin/project/list', {
    page_title: '项目列表',
    projects: projects
  });
};

exports.delete = async (ctx) => {
  const id = ctx.request.query.id;
  await project_service.deleteById(id);
  await ctx.redirect('/admin/project/list');
};
