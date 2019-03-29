const Koa = require('koa');
const koaBody = require('koa-body');
const koaLogger = require('koa-logger');
const koaSession = require('koa-session');
const koaNjk = require('koa-njk');
const error = require('./middlewares/error');
const koaStatic = require('koa-static');
const path = require('path');
const models = require('./models/models');
const config = require('./config');
const moment = require('./utils/moment');
const marked = require('./utils/marked');

console.log(`当前启动服务的环境是：${process.env.NODE_ENV}`);

const app = new Koa();
// 创建表
models.sync();

app.use(error());
app.use(koaLogger());

app.keys = [ 'team-koa-session' ];
const sessionOpt = {
  key: 'SESSIONID' /** (string) cookie key (default is koa:sess) */,
  /** (number || 'session') maxAge in ms (default is 1 days) */
  /** 'session' will result in a cookie that expires when session/browser is closed */
  /** Warning: If a session cookie is stolen, this cookie will never expire */
  maxAge: 86400000,
  autoCommit: true /** (boolean) automatically commit headers (default true) */,
  overwrite: true /** (boolean) can overwrite or not (default true) */,
  httpOnly: true /** (boolean) httpOnly or not (default true) */,
  signed: true /** (boolean) signed or not (default true) */,
  rolling: false /** (boolean) Force a session identifier cookie to be set on every response. The expiration is reset to the original maxAge, resetting the expiration countdown. (default is false) */,
  renew: false /** (boolean) renew session when session is nearly expired, so we can always keep user logged in. (default is false)*/
};
app.use(koaSession(sessionOpt, app));

app.use(koaStatic(path.join(__dirname, 'static')));
app.use(
  koaNjk(path.join(__dirname, 'views'), '.html', { autoescape: false }, (env) => {
    env.addFilter('marked', (content) => {
      return marked(content);
    });
    env.addFilter('fromNow', (time) => {
      console.log(time);
      return moment(time).fromNow();
    });
  })
);
app.use(koaBody());

// ctx.state
app.use(async (ctx, next) => {
  ctx.state = Object.assign(ctx.state, {
    _user: ctx.session.user,
    is_pjax: ctx.headers['x-pjax'],
    admins: config.admins,
    base_url: config.base_url,
    ws_url: config.ws_url,
    ws_secure: config.ws_secure
  });
  await next();
});

const router = require('./routes/routes');
app.use(router.routes());

// 创建socket.io服务
const server = require('http').Server(app.callback());
const io = require('socket.io')(server);

require('./ws/ws')(io);

server.listen(config.port, () => {
  console.log(
    `Current NODE_ENV: ${process.env.NODE_ENV}\nListening port on: ${config.port} \nVisit: http://localhost:3002`
  );
});
