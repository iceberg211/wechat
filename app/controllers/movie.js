// 0. 电影分类 Model 创建
// 1. 电影分类的录入页面
const mongoose = require('mongoose')
const Movie = mongoose.model('Movie')
const Category = mongoose.model('Category');
const Comment = mongoose.model('Comment');
const _ = require('lodash');

const { resolve } = require('path');
const { readFile, writeFile } = require('fs');
const util = require('util')
const readFileAsync = util.promisify(readFile)
const writeFileAsync = util.promisify(writeFile)
const api = require('../api');



exports.details = async (ctx, next) => {
  const _id = ctx.params.id;
  // console.log(ctx.params);
  const movie = await api.movie.findMovieById(_id)

  await Movie.update({ _id }, { $inc: { pv: 1 } })
  // 更新Pv
  await Movie.update({ _id }, { $inc: { pv: 1 } });

  const comments = await Comment.find({
    movie: _id
  })
    .populate('from', '_id nickname')
    .populate('replies.from replies.to', '_id nickname')

  await ctx.render('pages/detail', {
    title: '电影详情页面',
    movie,
    comments
  })
}

exports.show = async (ctx, next) => {
  const { _id } = ctx.params
  let movie = {}

  if (_id) {
    movie = await api.movie.findMovieById(_id)
  }
  let categories = await api.movie.findCategories();
  await ctx.render('pages/movie_admin', {
    title: '后台分类录入页面',
    movie,
    categories
  })
}


exports.savePoster = async (ctx, next) => {
  const posterData = ctx.request.body.files.uploadPoster
  const filePath = posterData.path
  const fileName = posterData.name

  if (fileName) {
    const data = await readFileAsync(filePath)
    const timestamp = Date.now()
    const type = posterData.type.split('/')[1]
    const poster = timestamp + '.' + type
    const newPath = resolve(__dirname, '../../../../../', 'public/upload/' + poster)

    await writeFileAsync(newPath, data)

    ctx.poster = poster
  }

  await next()
}

// 2. 电影分类的创建持久化,如何建立分类与电影列表的集合关系
exports.new = async (ctx, next) => {
  let movieData = ctx.request.body.fields || {}
  let movie

  if (movieData._id) {
    movie = await api.movie.findMovieById(movieData._id)
  }
  const { categoryId, categoryName } = movieData;

  let category

  // 如果id集合存在
  if (categoryId) {
    category = await api.movie.findCategoryById(categoryId)
    // 没有传递id
  } else if (categoryName) {
    category = new Category({ name: categoryName })
    await category.save()
  }

  if (movie) {
    movie = _.extend(movie, movieData)
    movie.category = category._id;

  } else {
    delete movieData._id;
    movieData.category = category._id;
    movie = new Movie(movieData);
  }

  category = await api.movie.findCategoryById(category._id)

  // 建立起集合的对应关系
  if (category) {
    category.movies = category.movies || [];
    category.movies.push(movie._id);
    await category.save();
  }

  await movie.save()

  ctx.redirect('/admin/movie/list')
}


// 2. 电影分类的创建持久化
exports.list = async (ctx, next) => {
  const movies = await api.movie.findMoviesAndCategory('name')
  await ctx.render('pages/movie_list', {
    title: '分类的列表页面',
    movies
  })
}



// 3. 删除电影数据,删除分类的时候，会删除所有的分类，删除一部电影的时候，应该删除分类中的数据
exports.del = async (ctx, next) => {

  const id = ctx.query.id;

  const cat = await Category.findOne({ movies: { $in: [id] } })  // 查询集合中的电影字段数据

  if (cat && cat.movies.length) {
    const index = cat.movies.indexOf(id);
    cat.movies.splice(index, 1);
    await cat.save();
  }

  try {
    await Movie.remove({ _id: id })
    ctx.body = { success: true }
  } catch (err) {
    ctx.body = { success: false }
  }
}

// 电影搜索功能
exports.search = async (ctx, next) => {
  const { cat, q, p } = ctx.query
  const page = parseInt(p, 10) || 0;
  const count = 2;
  const index = page * count;

  if (cat) {
    // 找到合计
    const categories = await api.movie.searchByCategroy(cat)
    const category = categories[0];
    let movies = category.movies || []
    let results = movies.slice(index, index + count)

    await ctx.render('pages/results', {
      title: '分类搜索结果页面',
      keyword: category.name,
      currentPage: (page + 1),
      query: 'cat=' + cat,
      totalPage: Math.ceil(movies.length / count),
      movies: results,
    })
    // 全局的搜索
  } else {
    let movies = await api.movie.searchByKeyword(q)
    let results = movies.slice(index, index + count)
    await ctx.render('pages/results', {
      title: '关键词搜索结果页面',
      keyword: q,
      currentPage: (page + 1),
      query: 'q=' + q,
      totalPage: Math.ceil(movies.length / count),
      movies: results,
    })
  }
}
