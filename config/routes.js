const Wechat = require('../app/controllers/wechat');
const User = require('../app/controllers/user');
const Index = require('../app/controllers/index');

module.exports = router => {

  router.get('/', Index.homePage)

  // 用户的注册登录路由
  router.get('/user/signup', User.showSignup)
  router.get('/user/signin', User.showSignin)
  router.post('/user/signup', User.signup)
  router.post('/user/signin', User.signin)
  router.get('/logout', User.logout)

  // 进入微信消息中间件 ，通过Wechat  controllers转发
  router.get('/wx-hear', Wechat.hear);
  router.post('/wx-hear', Wechat.hear);
  // 异步处理网页的签名

  router.post('/wechat/signature', Wechat.getSDKSignature)
  // 跳到授权中间服务页面
  router.get('/wx-oauth', Wechat.oauth);
  // 通过 code 获取用户信息

  router.get('/userinfo', Wechat.userinfo);
  router.get('/sdk', Wechat.sdk);

  router.get('/admin/user/list', User.list)

}
