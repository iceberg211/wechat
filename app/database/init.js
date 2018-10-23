const mongoose = require('mongoose');
const glob = require('glob')
const { resolve } = require('path');

mongoose.Promise = global.Promise;



// 拿到数据模型
exports.initSchemas = () => {
  glob.sync(resolve(__dirname, './schema', '**/*.js')).forEach(require)
}

exports.connect = (db) => {
  // 开启调试模式
  // if (process.env.NODE_ENV !== 'production') {
  //   mongoose.set('debug', true)
  // }
  let maxConnectTimes = 0;
  return new Promise(function (resolve, reject) {

    mongoose.connect(db, { useNewUrlParser: true });
    mongoose.connection.on('disconnect', () => {
      maxConnectTimes++;
      if (maxConnectTimes < 5) {
        mongoose.connect(db, { useNewUrlParser: true });
      } else {
        reject();
        throw new Error('数据库挂了')
      }
    })
    mongoose.connection.on('error', err => {
      maxConnectTimes++;
      if (maxConnectTimes < 5) {
        mongoose.connect(db, { useNewUrlParser: true });
      } else {
        reject();
        throw new Error('数据库挂了')
      }
    })
    mongoose.connection.on('open', () => {
      console.log('连接成功')
      resolve();
    })
  })
}
