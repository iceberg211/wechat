const Koa = require('koa');
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

  // 使用中间件
  app.use(wechat(config, reply.reply));

  app.listen(config.port, () => console.log(`listen at 2333`));
})()
