
const request = require('request-promise')
const base = 'https://api.weixin.qq.com/sns/';

const api = {
  authorize: 'https://open.weixin.qq.com/connect/oauth2/authorize?',
  accessToken: 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential',
  userInfo: base + 'userinfo?'
}

/**
 *
 * 接受到实例化的时候传入的参数，默认会发出token请求
 * @class WeChat
 */
class WeChat {
  constructor(opts) {

    this.opts = Object.assign({}, opts);

    this.appID = opts.appID;
    this.appSecret = opts.appSecret;
    this.getAccessToken = opts.getAccessToken;
    this.saveAccessToken = opts.saveAccessToken;

    this.fetchAccessToken();
  }
  async request(options) {
    const ops = Object.assign({}, options, { json: true });
    try {
      const res = await request(ops);
      return res;

    } catch (error) {
      console.log(error);
    }
  }

  /**
   *   1. 首先检查数据库里的 token 是否过期
   *   2. 过期则刷新
   *   3. token 入库
   */
  async fetchAccessToken() {
    // 获取
    let data = await this.getAccessToken();
    // if (this.getAccessToken) {
    //   data = await this.getAccessToken();
    // }
    // 如果token不合法
    if (!this.isValidToken(data)) {
      data = await this.updateAccessToken();
    }
    return data;
  }

  /**
   *
   * 获取新的token
   * @returns
   * @memberof WeChat
   */
  async updateAccessToken() {
    const url = `${api.accessToken}&appid=${this.appID}&secret=${this.appSecret}`

    const data = await this.request({ url })
    console.log('原始data', data)
    const now = new Date().getTime()
    const expiresIn = now + (data.expires_in - 20) * 1000

    data.expires_in = expiresIn
    console.log(data);

    return data;
  }
  isValidToken(data) {
    if (!data || !data.expiresIn) {
      return false;
    }
    const expiresIn = data.expiresIn;
    const now = new Date().getTime();
    // 如果小于，说明token没有失效
    if (now < expiresIn) {
      return true;
    } else {
      return false;
    }

  }
}

module.exports = WeChat;
