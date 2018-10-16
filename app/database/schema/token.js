// schema
// model
// entity
const mongoose = require('mongoose')
const Schema = mongoose.Schema

// 建模
const TokenSchema = new Schema({
  name: String, // accessToken
  token: String,
  expires_in: Number,
  meta: {
    createdAt: {
      type: Date,
      default: Date.now()
    },
    updatedAt: {
      type: Date,
      default: Date.now()
    }
  }
})

// 钩子函数中间件
TokenSchema.pre('save', function (next) {
  // 如果新增
  if (this.isNew) {
    this.meta.createdAt = this.meta.updatedAt = Date.now()
  } else {
    this.meta.updatedAt = Date.now()
  }

  next()
})

// 定义在类模型上的静态方法，不能被实例化
TokenSchema.statics = {
  async getAccessToken() {
    const token = await this.findOne({
      name: 'access_token'
    })

    if (token && token.token) {
      token.access_token = token.token
    }

    return token
  },
  async saveAccessToken(data) {
    let token = await this.findOne({
      name: 'access_token'
    })

    if (token) {
      token.token = data.access_token
      token.expires_in = data.expires_in
    } else {
      // 创建一条数据
      token = new Token({
        name: 'access_token',
        token: data.access_token,
        expires_in: data.expires_in
      })
    }

    await token.save()

    return data
  }
}

const Token = mongoose.model('Token', TokenSchema)
