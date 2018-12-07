const mongoose = require('mongoose')
const User = mongoose.model('User')
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

exports.getUserinfoByCode = async (code) => {
  const oauth = getOAuth()
  const data = await oauth.fetchAccessToken(code)
  const userData = await oauth.getUserInfo(data.access_token, data.openid)

  return userData
}


// 保存完
exports.saveWechatUser = async (userData) => {
  let query = {
    openid: userData.openid
  }

  if (userData.unionid) {
    query = {
      unionid: userData.unionid
    }
  }

  let user = await User.findOne(query)

  if (!user) {
    user = new User({
      openid: [userData.openid],
      unionid: userData.unionid,
      nickname: userData.nickname,
      email: (userData.unionid || userData.openid) + '@wx.com',
      province: userData.province,
      country: userData.country,
      city: userData.city,
      gender: userData.gender || userData.sex
    })

    console.log(user)

    user = await user.save()
  }

  return user
}
