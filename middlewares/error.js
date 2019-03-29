const result = require('../utils/result');

module.exports = () => {
  return async (ctx, next) => {
    await next().catch(async (err) => {
      const accept = ctx.headers.accept;
      if (accept.split(',').indexOf('text/html') > -1) {
        await ctx.render('error', {
          status: err.statusCode || err.status || 500,
          message: err.message,
          stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
      } else {
        console.error(err.stack);
        ctx.body = result(err.statusCode || err.status || 500, err.message, null);
      }
    });
  };
};
