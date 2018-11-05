// const mongoose = require('mongoose')
// const User = mongoose.model('User')
const { getOAuth, getWechat } = require('../../wechat/index');
const util = require('../../wechat-lib/util');

//  获取签名
exports.getSignature = async (url) => {
  const client = getWechat()
  const data = await client.fetchAccessToken()
  const token = data.access_token
  const ticketData = await client.fetchTicket(token)
  const ticket = ticketData.ticket

  let params = util.sign(ticket, url)
  params.appId = client.appID

  return params
}


// 获取权限认证Url
exports.getAuthorizeURL = (scope, target, state) => {
  const oauth = getOAuth()
  const url = oauth.getAuthorizeURL(scope, target, state)

  return url
}
