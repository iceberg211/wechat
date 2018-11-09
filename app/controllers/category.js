// 0. 电影分类 Model 创建
// 1. 电影分类的录入页面
const mongoose = require('mongoose')
const Category = mongoose.model('Category')
const api = require('../api')

exports.show = async (ctx, next) => {
  const { _id } = ctx.params;
  let category = {}

  if (_id) {
    category = await api.movie.findCategoryById(_id)
  }

  await ctx.render('pages/category_admin', {
    title: '后台分类录入页面',
    category
  })
}

// 2. 电影分类的创建持久化
exports.new = async (ctx, next) => {

  const { name, _id } = ctx.request.body.category;

  let category;
  // 先去查找
  if (_id) {
    category = await api.movie.findCategoryById(_id)
  }
  // 如果存在，则保存
  if (category) {
    category.name = name;
  } else {
    category = new Category({ name });
  }

  await category.save();

  ctx.redirect('/admin/category/list');

}


// 2. 电影分类的创建持久化
exports.list = async (ctx, next) => {
  const categories = await api.movie.findCategories()
  await ctx.render('pages/category_list', {
    title: '分类的列表页面',
    categories,
  });
}

// 3 .分类的删除
exports.del = async (ctx, next) => {
  const id = ctx.query.id
  // 删除一个分类的时候应该删除所有的分类
  try {
    await Category.remove({ _id: id })
    await Movie.remove({
      category: id
    })
    ctx.body = { success: true }
  } catch (err) {
    ctx.body = { success: false }
  }
}
