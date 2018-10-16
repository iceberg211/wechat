const Koa = require('koa');
const wechat = require('./wechat-lib/middleware')
const config = require('./config/config');
const reply = require('./wechat/reply');
const { initSchemas, connect } = require('./app/database/init');


; (async () => {
  await connect(config.db);

  initSchemas();


  const app = new Koa();

  app.use(wechat(config, reply.reply));

  app.listen(config.port, () => console.log(`listen at 2333`));
})()
