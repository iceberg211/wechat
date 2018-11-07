// 0. 电影分类 Model 创建
// 1. 电影分类的录入页面
const mongoose = require('mongoose')
const Movie = mongoose.model('Movie')
const Category = mongoose.model('Category');



exports.show = async (ctx, next) => {
  const { _id } = ctx.params;
  let movie = {}

  await ctx.render('pages/movie_admin', {
    title: '后台分类录入页面',
    movie
  })
}

// 2. 电影分类的创建持久化
exports.new = async (ctx, next) => {
  let movieData = ctx.request.body.fields || {};
  let movie

  if (movieData._id) {
    movie = await Movie.find({ _id: movieData._id });
  }

  const { categoryId, categoryName } = movieData;

  let category

  // 如果存在集合
  if (categoryId) {

    category = await Category.findOne({ _id: categoryId });
    // 如果存在集合名字
  } else if (categoryName) {
    category = new Category({ name: categoryName });
    await category.save();
  }


  if (movie) {
    movie = _.extend(movie, movieData)
    movie.category = category._id;

  } else {
    delete movieData._id;
    movieData.category = category._id;
    movie = new Movie(movieData)
  }

  category = await Category.findOne({ _id: category.id });

  if (category) {
    category.movies = category.movies || [];
    category.movies.push(movie.id);
  }

  await movie.save()

  ctx.redirect('/admin/movie/list')
}


// 2. 电影分类的创建持久化
exports.list = async (ctx, next) => {
  const movies = await Movie.find({}).sort('meta.createdAt');
  await ctx.render('pages/movie_list', {
    title: '分类的列表页面',
    movies,
  });
}
