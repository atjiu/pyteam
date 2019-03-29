const user_service = require('../services/user_service');

exports.is_login = async (ctx, next) => {
  if (ctx.session.user && ctx.session.user.id) {
    let user = await user_service.findById(ctx.session.user.id);
    ctx.session.user = user;
    await next();
  } else {
    ctx.session.user = null;
    await ctx.render('login', {
      page_title: '登录'
    });
  }
};
