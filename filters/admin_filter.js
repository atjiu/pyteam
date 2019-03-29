const config = require('../config');

exports.is_admin = async (ctx, next) => {
  if (config.admins.indexOf(ctx.session.user.username) !== -1) {
    await next();
  } else {
    await ctx.throw(new Error('你不是管理员'));
  }
};
