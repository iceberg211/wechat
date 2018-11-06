const Koa = require('koa');
const Router = require('koa-router');
const config = require('./config/config');
const bodyParser = require('koa-bodyparser')
const session = require('koa-session')
const moment = require('moment');
const { initSchemas, connect } = require('./app/database/init');
const { resolve } = require('path');

; (async () => {
  // 连接
  await connect(config.db);

  // 初始化模型
  initSchemas();
  const app = new Koa();
  const router = new Router();
  const views = require('koa-views')

  app.keys = ['iceberg211']
  app.use(session(app))
  app.use(bodyParser())

  app.use(views(resolve(__dirname, 'app/views'), {
    extension: 'pug',
    options: {
      moment: moment
    }
  }))

  // 生成路由实例
  require('./config/routes')(router)
  // 所有的请求会进入到Koa的实例中去，
  app.use(router.routes()).use(router.allowedMethods())
  app.listen(config.port, () => console.log(`listen at 2333`));
})()
