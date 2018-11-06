const mongoose = require('mongoose');
const User = mongoose.model('User');

// 1. 实现一个注册页面的控制   showSignup
exports.showSignup = async (ctx, next) => {
  await ctx.render('pages/signup', {
    title: '注册页面'
  })
}

// 2. 增加一个的登录页面的控制 showSignin
exports.showSignin = async (ctx, next) => {
  await ctx.render('pages/signin', {
    title: '登录页面'
  })
}


// 3. 用户数据的持久化 signup
exports.signup = async (ctx, next) => {

  const {
    email,
    password,
    nickname
  } = ctx.query.body.user
  console.log(ctx.query);
  let user = User.find({ email });

  if (user) return ctx.redirect('signin');


  user = new User({
    email,
    password,
    nickname
  })

  ctx.session.user = {
    _id: user._id,
    nickname: user.nickname,
  }

  user = await user.save();

  ctx.redirect('/');

  await ctx.render('');
}

// 4. 增加一个登录的校验/判断 signin
exports.signin = async (ctx, next) => {

  const {
    email,
    password,
  } = ctx.query.body.user

  const user = User.find({ email });
  // 如果没登陆
  if (!user) return ctx.redirect('/signup');

  // 检查密码
  const isMatch = await user.comparePassword(password, user.password);

  if (isMatch) {
    ctx.session.user = {
      _id: user._id,
      nickname: user.nickname,
    }
    ctx.redirect('/');
  } else {
    ctx.redirect('/signup');
  }
}

// 5. 增加路由规则


// 6. 增加两个 Pug 页面，注册和登录
// 7. koa-bodyparser



// 登出
exports.logout = async (ctx, next) => {
  ctx.session.user = {}

  ctx.redirect('/')
}
