const task_service = require('../services/task_service');
const task_dynamic_service = require('../services/task_dynamic_service');

exports.index = async (ctx) => {
  const taskId = ctx.params.taskId;
  const { task, project_users } = await task_service.findById(taskId);
  await ctx.render('task', {
    page_title: '任务',
    task: task,
    project_users: project_users
  });
};

exports.my_task = async (ctx) => {
  await ctx.render('my_task', {
    page_title: '我的任务'
  });
};
