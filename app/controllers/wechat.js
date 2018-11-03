const config = require('../../config/config');
// const api = require('../api/index')
const { getOAuth } = require('../../wechat/index');
// 消息中间件
const wechatMiddle = require('../../wechat-lib/middleware')
// 恢复策略
const { reply } = require('../../wechat/reply')

// 针对微信业务的控制器
exports.hear = async (ctx, next) => {
  const middleWare = wechatMiddle(config, reply);

  await middleWare(ctx, next);
}


exports.oauth = async (ctx, next) => {
  const oauth = getOAuth();

  const target = config.baseUrl + 'userinfo?'
  const scope = 'snsapi_userinfo'
  const state = ctx.query.id
  const url = oauth.getAuthorizeURL(scope, target, state)
  // 重定向
  ctx.redirect(url)

}


exports.userinfo = async (ctx, next) => {
  const oauth = getOAuth();

  const code = ctx.query.code;

  const data = await oauth.fetchAccessToken(code);

  console.log(data)
  const userData = await oauth.getUserInfo(data.access_token, data.openid);

  ctx.body = userData
}
