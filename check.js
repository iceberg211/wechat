const Koa = require('koa');
const wechat = require('../wechat/middleware')
const config = require('./config/config');


const app = new Koa();

app.use(wechat(config.wechat.token));

app.listen(2333, () => console.log(`listen at 2333`));