const xml2js = require('xml2js')
const template = require('./template')
const sha1 = require('sha1')

exports.parseXML = xml => {
  return new Promise((resolve, reject) => {
    xml2js.parseString(xml, { trim: true }, (err, content) => {
      if (err) reject(err)
      else resolve(content)
    })
  })
}

const formatMessage = result => {
  let message = {}

  if (typeof result === 'object') {
    const keys = Object.keys(result)

    for (let i = 0; i < keys.length; i++) {
      let item = result[keys[i]]
      let key = keys[i]

      if (!(item instanceof Array) || item.length === 0) {
        continue
      }

      if (item.length === 1) {
        let val = item[0]

        if (typeof val === 'object') {
          message[key] = formatMessage(val)
        } else {
          message[key] = (val || '').trim()
        }
      } else {
        message[key] = []

        for (let j = 0; j < item.length; j++) {
          message[key].push(formatMessage(item[j]))
        }
      }
    }
  }

  return message
}

exports.tpl = (content, message) => {
  let type = 'text'

  if (Array.isArray(content)) {
    type = 'news'
  }

  if (!content) content = 'Empty News'
  if (content && content.type) {
    type = content.type
  }

  let info = Object.assign({}, {
    content: content,
    msgType: type,
    createTime: new Date().getTime(),
    toUserName: message.FromUserName,
    fromUserName: message.ToUserName
  })

  return template(info)
}

const createNonce = () => {
  return Math.random().toString(36).substr(2, 16)
}

const createTimestame = () => {
  return parseInt(new Date().getTime() / 1000, 10) + ''
}

// 字典排序
const signIt = (paramsObj) => {
  let keys = Object.keys(paramsObj)
  let newArgs = {}
  let str = ''

  keys = keys.sort()
  keys.forEach(key => {
    newArgs[key.toLowerCase()] = paramsObj[key]
  })

  for (let k in newArgs) {
    str += '&' + k + '=' + newArgs[k]
  }

  return str.substr(1)
}

const shaIt = (nonce, ticket, timestamp, url) => {
  const ret = {
    jsapi_ticket: ticket,
    nonceStr: nonce,
    timestamp: timestamp,
    url
  }

  const str = signIt(ret)
  const sha = sha1(str)

  return sha
}


// 加密签名的入口方法
const sign = (ticket, url) => {
  // 生成随机串
  const noncestr = createNonce()
  // 生成时间戳
  const timestamp = createTimestame()
  // 加密
  const signature = shaIt(noncestr, ticket, timestamp, url)

  return {
    noncestr,
    timestamp,
    signature
  }
}

exports.sign = sign
exports.formatMessage = formatMessage
