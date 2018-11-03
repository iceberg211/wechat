const Koa = require('koa');
const Router = require('koa-router');
const wechat = require('./wechat-lib/middleware')
const config = require('./config/config');
const reply = require('./wechat/reply');
const { initSchemas, connect } = require('./app/database/init');


; (async () => {
  // 连接
  await connect(config.db);

  // 初始化模型
  initSchemas();

  const app = new Koa();

  // 生成路由实例
  const router = new Router();

  require('./config/routes')(router)

  // 所有的请求会进入到Koa的实例中去，
  app.use(router.routes()).use(router.allowedMethods())

  app.listen(config.port, () => console.log(`listen at 2333`));
})()
