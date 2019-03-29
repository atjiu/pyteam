const result = require('../utils/result');
const config = require('../config');
const user_service = require('../services/user_service');
const department_service = require('../services/department_service');

exports.index = async (ctx) => {
  let user = ctx.session.user;
  user = await user_service.findById(user.id);
  ctx.session.user = user;
  let users = await user_service.findByDepartmentId(user.departmentId);
  await ctx.render('index', {
    page_title: '首页',
    users: users
  });
};

exports.login = async (ctx) => {
  if (ctx.session.user) {
    await ctx.redirect('/');
  } else {
    await ctx.render('login', {
      layout: 'pjax-layout',
      page_title: '登录'
    });
  }
};

exports.process_login = async (ctx) => {
  if (ctx.session.user) {
    await ctx.redirect('/');
  } else {
    const username = ctx.request.body.username;
    const password = ctx.request.body.password;
    console.log(username, password);
    if (username.length === 0) {
      ctx.body = result(config.errorCode.FAILURE, '用户名不能为空', null);
      return;
    }
    if (password.length === 0) {
      ctx.body = result(config.errorCode.FAILURE, '密码不能为空', null);
      return;
    }
    let user = await user_service.login(username, password);
    if (user) {
      ctx.session.user = user;
      ctx.body = result(config.errorCode.SUCCESS, 'success', user);
    } else {
      ctx.body = result(config.errorCode.FAILURE, '用户名或密码不正确', null);
    }
  }
};

exports.register = async (ctx) => {
  if (ctx.session.user) {
    await ctx.redirect('/');
  } else {
    let departments = await department_service.findAll({});
    await ctx.render('register', {
      page_title: '注册',
      departments: departments
    });
  }
};

exports.process_register = async (ctx) => {
  if (ctx.session.user) {
    await ctx.redirect('/');
  } else {
    const username = ctx.request.body.username;
    const password = ctx.request.body.password;
    const departmentId = ctx.request.body.departmentId;
    if (username.length === 0) {
      ctx.body = result(config.errorCode.FAILURE, '用户名不能为空', null);
      return;
    }
    if (password.length === 0) {
      ctx.body = result(config.errorCode.FAILURE, '密码不能为空', null);
      return;
    }
    try {
      let user = await user_service.findByUsername(username);
      if (user) {
        ctx.body = result(config.errorCode.FAILURE, '用户名已被注册', null);
        return;
      }
      user = await user_service.register(username, password, departmentId);
      ctx.session.user = user;
      ctx.body = result(config.errorCode.SUCCESS, 'success', user);
    } catch (err) {
      ctx.body = result(config.errorCode.FAILURE, err.message, null);
    }
  }
};

exports.logout = async (ctx) => {
  ctx.session.user = null;
  await ctx.redirect('/');
};
