const user_service = require('../../services/user_service');
const department_service = require('../../services/department_service');

exports.list = async (ctx) => {
  let users = await user_service.findAll({});
  await ctx.render('admin/user/list', {
    users: users,
    page_title: '用户列表'
  });
};

exports.edit = async (ctx) => {
  const id = ctx.request.query.id;
  let user = await user_service.findById(id);
  let departments = await department_service.findAll({});
  await ctx.render('admin/user/edit', {
    page_title: '编辑用户',
    user: user,
    departments: departments
  });
};

exports.process_edit = async (ctx) => {
  const id = ctx.request.body.id;
  const username = ctx.request.body.username;
  const password = ctx.request.body.password;
  const departmentId = ctx.request.body.departmentId;
  if (departmentId.length === 0) {
    await ctx.throw(new Error('请选择部门'));
    return;
  }
  let oldUser = await user_service.findById(id);
  let newUser = await user_service.findByUsername(username);
  if (newUser && oldUser.username !== newUser.username) {
    await ctx.throw(new Error('用户名重复'));
    return;
  }
  await user_service.edit(id, username, password, departmentId);
  await ctx.redirect('/admin/user/list');
};

exports.delete = async (ctx) => {
  const id = ctx.request.query.id;
  await user_service.deleteById(id);
  await ctx.redirect('/admin/user/list');
};
