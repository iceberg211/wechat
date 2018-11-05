const Koa = require('koa');
const Router = require('koa-router');
const config = require('./config/config');
const views = require('koa-views');
const moment = require('moment');
const { initSchemas, connect } = require('./app/database/init');
const { resolve } = require('path');



; (async () => {
  // 连接
  await connect(config.db);

  // 初始化模型
  initSchemas();

  const app = new Koa();

  app.use(views(resolve(__dirname, 'app/views'), {
    extension: 'pug',
    options: {
      moment: moment
    }
  }))

  // 生成路由实例
  const router = new Router();

  require('./config/routes')(router)

  // 所有的请求会进入到Koa的实例中去，
  app.use(router.routes()).use(router.allowedMethods())

  app.listen(config.port, () => console.log(`listen at 2333`));
})()
