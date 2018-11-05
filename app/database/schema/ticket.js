// schema
// model
// entity
const mongoose = require('mongoose')
const Schema = mongoose.Schema

// 建模
const TicketSchema = new Schema({
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
TicketSchema.pre('save', function (next) {
  // 如果新增
  if (this.isNew) {
    this.meta.createdAt = this.meta.updatedAt = Date.now()
  } else {
    this.meta.updatedAt = Date.now()
  }

  next()
})

// 定义在类模型上的静态方法，不能被实例化
TicketSchema.statics = {
  async getTicket() {
    const ticket = await this.findOne({
      name: 'ticket'
    })

    if (ticket && ticket.ticket) {
      ticket.ticket = ticket.ticket
    }

    return ticket
  },
  async saveTicket(data) {
    let ticket = await this.findOne({
      name: 'ticket'
    })

    if (ticket) {
      ticket.ticket = data.ticket
      ticket.expires_in = data.expires_in
    } else {
      // 创建一条数据
      ticket = new ticket({
        name: 'ticket',
        ticket: data.ticket,
        expires_in: data.expires_in
      })
    }

    await ticket.save();

    return data
  }
}

const Ticket = mongoose.model('Ticket', TicketSchema)
