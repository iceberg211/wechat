const mongoose = require('mongoose')
const Category = mongoose.model('Category')
const Movie = mongoose.model('Movie')
const rp = require('request-promise')
const _ = require('lodash');

// 按照分类Id搜索
exports.searchByCategroy = async (catId) => {
  const data = await Category.find({
    _id: catId
  }).populate({
    path: 'movies',
    select: '_id title poster',
    options: { limit: 8 }
  })

  return data
}

// 关键词搜索
exports.searchByKeyword = async (key) => {
  // 正则模糊匹配
  const data = await Movie.find({
    title: new RegExp(key + '.*', 'i')
  })

  return data;
}

// 通过电影Id查询
exports.findMovieById = async (id) => {
  const data = await Movie.findOne({
    _id: id
  })

  return data
}

// 根据分类Id查询
exports.findCategoryById = async (id) => {
  const data = await Category.findOne({
    _id: id
  })

  return data
}


exports.findCategories = async (id) => {
  const data = await Category.find({})

  return data
}



exports.findMoviesAndCategory = async (fields) => {
  const data = await Movie.find({
  }).populate('category', fields)

  return data
}
