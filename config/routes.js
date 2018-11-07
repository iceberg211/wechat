const Wechat = require('../app/controllers/wechat');
const User = require('../app/controllers/user');
const Index = require('../app/controllers/index');
const Category = require('../app/controllers/category');
const Movie = require('../app/controllers/movie');


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


  // router.get('/admin/category', User.signinRequired, User.adminRequired, Category.show)
  router.get('/admin/category', User.signinRequired, Category.show)
  router.post('/admin/category', User.signinRequired, Category.new)
  router.get('/admin/category/list', User.signinRequired, Category.list)
  router.get('/admin/category/update/:_id', User.signinRequired, Category.show)
  // router.delete('/admin/category', User.signinRequired, Category.del)


  router.get('/admin/movie', User.signinRequired, Movie.show)
  router.post('/admin/movie', User.signinRequired, Movie.new)
  router.get('/admin/movie/list', User.signinRequired, Movie.list)
  router.get('/admin/movie/update/:_id', User.signinRequired, Movie.show)

}
