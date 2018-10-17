const sha1 = require('sha1');
const getRawBody = require('raw-body')
const util = require('./util')

/*
 * 暴露出中间件
 *  next为串联中间件的的钩子函数
 */
module.exports = (config, reply) => {
  return async (ctx, next) => {
    const { signature, timestamp, nonce, echostr } = ctx.query
    const token = config.wechat.token;
    let str = [token, timestamp, nonce].sort().join('');
    const sha = sha1(str);
    if (ctx.method === 'GET') {
      if (sha === signature) {
        ctx.body = echostr
      } else {
        ctx.body = 'wrong'
      }
    } else if (ctx.method === 'POST') {
      if (sha !== signature) {
        return (ctx.body = 'Failed')
      }

      const data = await getRawBody(ctx.req, {
        length: ctx.length,
        limit: '1mb',
        encoding: ctx.charset
      })
      // 解析XMl
      const content = await util.parseXML(data)

      // 数据扁平化
      const message = util.formatMessage(content.xml)

      // 将接受的信息挂在ctx上下文上
      ctx.wexin = message;

      // 使用appley让reply拥有ctx的上下文
      await reply.apply(ctx, [ctx, next]);

      const replyBody = ctx.body;
      const msg = ctx.wexin;
      const xml = util.tpl(replyBody, msg)


      ctx.status = 200
      ctx.type = 'application/xml'
      ctx.body = xml
    }
  }
}
