const { resolve } = require('path');

/*
 *** 回复策略，略傻
*/
exports.reply = async (ctx, next) => {

  // 通过文件引用，拿到实例，每一个请求都需要reply，必须
  let mp = require('../wechat');

  let client = mp.getWechat();

  const message = ctx.wexin;

  if (message.MsgType === 'text') {
    let content = message.Content;
    let reply = `你说的${content}太复杂了`
    if (content === '1') {
      reply = '星球大战'
    } else if (content === '2') {
      reply = '星球大战2'
    } else if (content === '3') {
      reply = '星球大战3'
    } else if (content === '4') {
      let data = client.handle('uploadMaterial', 'image', resolve(__dirname, '../2.jpg'));
    }
    ctx.body = reply;
  }
  await next();
}
