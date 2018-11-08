// 0. 电影分类 Model 创建
// 1. 电影分类的录入页面
const mongoose = require('mongoose')
const Movie = mongoose.model('Movie')
const Category = mongoose.model('Category');

const { resolve } = require('path');
const { readFile, writeFile } = require('fs');
const util = require('util')
const readFileAsync = util.promisify(readFile)
const writeFileAsync = util.promisify(writeFile)


exports.show = async (ctx, next) => {
  const _id = ctx.params._id
  const movie = await api.movie.findMovieById(_id)

  // await Movie.update({ _id }, { $inc: { pv: 1 } })

  // const comments = await Comment.find({
  //   movie: _id
  // })
  //   .populate('from', '_id nickname')
  //   .populate('replies.from replies.to', '_id nickname')

  await ctx.render('pages/detail', {
    title: '电影详情页面',
    movie,
    // comments
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

// 2. 电影分类的创建持久化
exports.new = async (ctx, next) => {
  let movieData = ctx.request.body || {}
  let movie


  if (movieData._id) {
    movie = await Movie.findOne({ _id: movieData._id })
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
    movie = new Movie(movieData);
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


// 3. 删除电影数据
exports.del = async (ctx, next) => {
  const id = ctx.query.id;
  let movie;

  // if (id) {
  //   movie = await Movie.findOne({ _id: id });
  // }

  // // 如果没有找到话
  // if (!movie) {
  //   return (ctx.body = {
  //     success: false,
  //   })
  // }

  try {
    await Movie.remove({ _id: id })
    ctx.body = { success: true }
  } catch (err) {
    ctx.body = { success: false }
  }
}
