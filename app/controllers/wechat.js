const config = require('../../config/config');
// const api = require('../api/index')
const { getOAuth, getWechat } = require('../../wechat/index');
// 消息中间件
const wechatMiddle = require('../../wechat-lib/middleware');
// 恢复策略
const { reply } = require('../../wechat/reply');
const api = require('../api/index')

function isWechat(ua) {
  if (ua.indexOf('MicroMessenger') >= 0) {
    return true
  } else {
    return false
  }
}

exports.getSDKSignature = async (ctx, next) => {
  let url = ctx.query.url

  url = decodeURIComponent(url)

  const params = await api.wechat.getSignature(url)

  ctx.body = {
    success: true,
    data: params
  }
}

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

// skd控制器
exports.sdk = async (ctx, next) => {
  const url = ctx.href
  const params = await api.wechat.getSignature(url)

  await ctx.render('wechat/sdk', params)
}


exports.userinfo = async (ctx, next) => {
  const userData = await api.wechat.getUserinfoByCode(ctx.query.code)

  ctx.body = userData
}

// exports.userinfo = async (ctx, next) => {
//   const oauth = getOAuth();

//   const code = ctx.query.code;

//   const data = await oauth.fetchAccessToken(code);

//   const userData = await oauth.getUserInfo(data.access_token, data.openid);

//   ctx.body = userData
// }

exports.oauth = async (ctx, next) => {
  const state = ctx.query.id
  const scope = 'snsapi_userinfo'
  const target = config.baseUrl + 'userinfo'
  const url = api.wechat.getAuthorizeURL(scope, target, state)

  ctx.redirect(url)
}


exports.checkWechat = async (ctx, next) => {
  const ua = ctx.headers['user-agent']
  const code = ctx.query.code

  // 所有的网页请求都会流经这个中间件，包括微信的网页访问
  // 针对 POST 非 GET 请求，不走用户授权流程
  if (ctx.method === 'GET') {
    // 如果参数带 code，说明用户已经授权
    if (code) {
      await next()
      // 如果没有 code，且来自微信访问，就可以配置授权的跳转
    } else if (isWechat(ua)) {
      const target = ctx.href
      const scope = 'snsapi_userinfo'
      const url = api.wechat.getAuthorizeURL(scope, target, 'fromWechat')

      ctx.redirect(url)
    } else {
      await next()
    }
  } else {
    await next()
  }
}



exports.wechatRedirect = async (ctx, next) => {
  const { code, state } = ctx.query

  if (code && state === 'fromWechat') {
    const userData = await api.wechat.getUserinfoByCode(code)
    const user = await api.wechat.saveWechatUser(userData)

    ctx.session.user = {
      _id: user._id,
      role: user.role,
      nickname: user.nickname
    }

    ctx.state = Object.assign(ctx.state, {
      user: {
        _id: user._id,
        role: user.role,
        nickname: user.nickname
      }
    })
  }

  await next()
}
