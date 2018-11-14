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
  } = ctx.request.body.user
  let user = User.find({ email });

  if (user) return ctx.redirect('signin');

  user = new User({
    email,
    password,
    nickname
  })

  ctx.session.user = {
    _id: user._id,
    role: user.role,
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
  } = ctx.request.body.user

  const user = await User.findOne({ email })
  // 如果没登陆
  if (!user) return ctx.redirect('/signup');

  // 检查密码
  const isMatch = await user.comparePassword(password, user.password);

  if (isMatch) {
    ctx.session.user = {
      _id: user._id,
      nickname: user.nickname,
      role: user.role,
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


exports.list = async (ctx, next) => {
  const users = await User.find({}).sort('meta.createdAt');

  await ctx.render('pages/userList', {
    title: '用户列表',
    users
  })
}

// 需要登陆的中间件控制
exports.signinRequired = async (ctx, next) => {
  const user = ctx.session.user;
  // 如果user不存在，或者id不存在
  if (!user || !user._id) {
    return ctx.redirect('/user/signin');
  }

  await next();
}

exports.adminRequired = async (ctx, next) => {

  const user = ctx.session.user;

  if (user.role !== 'admin') {
    return ctx.redirect('/user/signin');
  }
  await next();
}


exports.del = async (ctx, next) => {
  const id = ctx.query.id

  try {
    await User.remove({ _id: id })
    ctx.body = { success: true }
  } catch (err) {
    ctx.body = { success: false }
  }
}
