const Koa = require('koa');
const Router = require('koa-router');
const config = require('./config/config');
const bodyParser = require('koa-bodyparser')
const session = require('koa-session')
const moment = require('moment');
const { initSchemas, connect } = require('./app/database/init');
const { resolve } = require('path');
const mongoose = require('mongoose');
const serve = require('koa-static');


; (async () => {
  // 连接
  await connect(config.db);

  // 初始化模型
  initSchemas();
  const app = new Koa();
  const router = new Router();
  const views = require('koa-views')

  app.keys = ['iceberg211']

  app.use(session(app));
  app.use(bodyParser());
  app.use(serve(resolve(__dirname, '../public')))

  // 前置微信状态检查
  const wechatController = require('./app/controllers/wechat')
  app.use(wechatController.checkWechat)
  app.use(wechatController.wechatRedirect)


  app.use(async (ctx, next) => {
    const User = mongoose.model('User')
    let user = ctx.session.user

    if (user && user._id) {
      user = await User.findOne({ _id: user._id })

      if (user) {
        ctx.session.user = {
          _id: user._id,
          role: user.role,
          nickname: user.nickname
        }
        ctx.state = Object.assign(ctx.state, {
          user: {
            _id: user._id,
            nickname: user.nickname
          }
        })
      }
    } else {
      ctx.session.user = null
    }

    await next()
  })

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
