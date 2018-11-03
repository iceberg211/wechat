const Wechat = require('../app/controllers/wechat')

module.exports = router => {
  // 进入微信消息中间件 ，通过Wechat  controllers转发
  router.get('/wx-hear', Wechat.hear);
  router.post('/wx-hear', Wechat.hear);
  router.get('/wx-sdk', Wechat.sdk);

  // 异步处理网页的签名
  // router.post('/wechat/signature', Wechat.getSDKSignature)

  // 跳到授权中间服务页面
  router.get('/wx-oauth', Wechat.oauth);
  // 通过 code 获取用户信息
  router.get('/userinfo', Wechat.userinfo);
}
