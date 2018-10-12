
/*
 *** 回复策略
*/
exports.reply = async (ctx, next) => {
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
      reply = '星球大战4'
    }
    ctx.body = reply;
  }
  await next();
}
