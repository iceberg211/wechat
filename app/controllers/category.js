// 0. 电影分类 Model 创建
// 1. 电影分类的录入页面
const mongoose = require('mongoose')
const Category = mongoose.model('Category')


exports.show = async (ctx, next) => {
  await ctx.render('pages/category_admin');
}

// 2. 电影分类的创建持久化
exports.new = async (ctx, next) => {

  const { name } = ctx.request.body.category;
  // 创建一个新的分类
  const category = new Category({
    name,
  });

  await category.save();

  ctx.redirect('/admin/category/list');

}


// 2. 电影分类的创建持久化
exports.list = async (ctx, next) => {

  const categories = await Category.find({}).sort('meta.createdAt');
  await ctx.render('/admin/category/list', {
    title: '分类的列表页面',
    categories,
  });
}
