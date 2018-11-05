
const request = require('request-promise')
const base = 'https://api.weixin.qq.com/sns/'
const api = {
  authorize: 'https://open.weixin.qq.com/connect/oauth2/authorize?',
  accessToken: base + 'oauth2/access_token?',
  userInfo: base + 'userinfo?'
}

/*
 *  如果用户在微信客户端中访问第三方网页，公众号可以通过微信网页授权机制，来获取用户基本信息，进而实现业务逻辑。
 *  // 1. 用户访问网页 /a
 *  // 2. 服务器构建二跳网页地址 /b?state&appid 各种参数追加
 *  // 3. 跳到微信授权页，用户主动授权，跳回来到 /a?code
 *  // 4. 通过 code 换取 token code => wechat => access_token, openid
 *  // 5. 通过 token + openid 换取资料 access_token => 用户资料
*/
module.exports = class WechatOAuth {
  constructor(opts) {
    this.appID = opts.appID
    this.appSecret = opts.appSecret
  }

  async request(options) {
    options = Object.assign({}, options, { json: true })

    try {
      const res = await request(options)

      return res
    } catch (err) {
      console.log(err)
    }
  }

  /**
   * 服务器构建二跳网页地址 /b?state&appid 各种参数追加
   * @param {string} [scope='snsapi_base'] 详细信息/主动授权： 基本信息/静默授权： snsapi_base
   * @param {*} target
   * @param {*} state
   * @returns  返回一个code，
   */
  getAuthorizeURL(scope = 'snsapi_base', target, state) {
    const url = `${api.authorize}appid=${this.appID}&redirect_uri=${encodeURIComponent(target)}&response_type=code&scope=${scope}&state=${state}#wechat_redirect`

    return url
  }


  // async fetchAccessToken(code) {
  //   const url = `${api.accessToken}appid=${this.appID}&secret=${this.appSecret}
  //   &code=${code}&grant_type=authorization_code`;

  //   const res = await this.request({ url });
  //   return res;

  // }

  // async getUserInfo(token, openID, lang = 'zh_CN') {
  //   const url = `${api.userInfo}access_token=${token}&openid=${openID}&lang=${lang}`
  //   const res = await this.request({ url })

  //   return res
  // }

  async fetchAccessToken(code) {
    const url = `${api.accessToken}appid=${this.appID}&secret=${this.appSecret}&code=${code}&grant_type=authorization_code`

    const res = await this.request({ url })

    return res
  }

  /** 通过 token + openid 换取资料 access_token => 用户资料
   * openid
   * @param {*} token
   * @param {*} openID
   * @param {string} [lang='zh_CN']
   * @returns  用户资料
   */
  async getUserInfo(token, openID, lang = 'zh_CN') {
    const url = `${api.userInfo}access_token=${token}&openid=${openID}&lang=${lang}`
    console.log(url)
    const res = await this.request({ url })

    return res
  }
}
