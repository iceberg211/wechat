const mongoose = require('mongoose');
const glob = require('glob')
const { resolve } = require('path');

mongoose.Promise = global.Promise;

// 拿到数据模型

exports.initSchemas = () => {
  glob.sync(resolve(__dirname, './schema', '**/*.js')).forEach(require)
}

exports.connect = (db) => {
  return new Promise(function (resolve, reject) {
    mongoose.connect(db);
    mongoose.connection.on('disconnect', () => {
      console.log('数据库连接失败');
      reject();
    })
    mongoose.connection.on('error', err => {
      console.log(err);
    })
    mongoose.connection.on('open', () => {
      console.log('连接成功')
      resolve();
    })
  })
}
