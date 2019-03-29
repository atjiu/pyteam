const department_service = require('../../services/department_service');

exports.list = async (ctx) => {
  let departments = await department_service.findAll({});
  await ctx.render('admin/department/list', {
    page_title: '部门列表',
    departments: departments
  });
};

exports.add = async (ctx) => {
  await ctx.render('admin/department/add', {
    page_title: '创建部门'
  });
};
exports.process_add = async (ctx) => {
  const name = ctx.request.body.name;
  await department_service.create(name);
  await ctx.redirect('/admin/department/list');
};

exports.edit = async (ctx) => {
  const id = ctx.request.query.id;
  let department = await department_service.findById(id);
  await ctx.render('admin/department/edit', {
    page_title: '编辑部门',
    department: department
  });
};
exports.process_edit = async (ctx) => {
  const id = ctx.request.body.id;
  const name = ctx.request.body.name;
  const userCount = ctx.request.body.userCount;
  await department_service.update(id, name, userCount);
  await ctx.redirect('/admin/department/list');
};
exports.delete = async (ctx) => {
  const id = ctx.request.body.id;
  await department_service.deleteById(id);
  await ctx.redirect('/admin/department/list');
};
