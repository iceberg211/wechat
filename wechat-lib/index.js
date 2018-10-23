
const request = require('request-promise');
const fs = require('fs');
const base = 'https://api.weixin.qq.com/';

const api = {
  accessToken: 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential',
  temporary: {
    upload: base + 'cgi-bin/media/upload?',
    fetch: base + 'media/get?',
  },
  permanent: {
    upload: base + 'cgi-bin/material/add_material?',
    uploadNew: base + 'cgi-bin/material/add_news?',
    uploadNewsPic: base + 'cgi-bin/media/uploadimg?',
    fetch: base + 'cgi-bin/material/get_material?',
    batch: base + 'cgi-bin/material/batchget_material?',
    count: base + 'cgi-bin/material/get_materialcount?',
    deletal: base + 'cgi-bin/material/del_material',
    updateNews: base + 'cgi-bin/material/update_news',
  }
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

    // 如果token不合法
    if (!this.isValidToken(data)) {
      data = await this.updateAccessToken();
    }

    await this.saveAccessToken(data)
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
    const now = new Date().getTime()
    const expiresIn = now + (data.expires_in - 20) * 1000

    data.expires_in = expiresIn

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

  /**
   * 上传素材方法
   * @param {*} token 票据token
   * @param {*} type  素材类型，
   * @param {*} material 文件类型
   * @param {boolean} [permanent=false] 永久或者临时
   * @memberof WeChat
   */
  uploadMaterial(token, type, material, permanent = false) {
    let form = {}

    let url = api.temporary.upload;

    // 如果是永久素材,继承外面传入的新对象
    if (permanent) {
      url = api.permanent.upload;
      form = Object.assign(form, permanent)
    }
    // 上传图文消息的图片素材
    if (type === 'pic') {
      url = api.permanent.uploadNewsPic
    }

    // 图文非图文的素材提交表单的切换
    if (type === 'news') {
      url = api.permanent.uploadNews
      form = material
    } else {
      form.media = fs.createReadStream(material)
    }
    // form.media = fs.createReadStream(material)

    let uploadUrl = `${url}access_token=${token}`;

    // 根据素材永久性填充token
    if (!permanent) {
      uploadUrl += `&type=${type}`
    } else {
      if (type !== 'news') {
        form.access_token = token
      }
    }
    const options = {
      method: 'POST',
      url: uploadUrl,
      json: true
    }

    // 图文和非图文在 request 提交主体判断
    if (type === 'news') {
      // 图文消息
      options.body = form
    } else {
      options.formData = form
    }


    return options;
  }

  async handle(operation, ...args) {

    const tokenData = await this.getAccessToken();

    const options = this[operation](tokenData.access_token, ...args);

    const data = await this.request(options)

    return data;

  }


  /**
   * @param {*} token  请求token
   * @param {*} mediaId  资源id
   * @param {*} type   类型
   * @param {*} permanent  扩展资源
   * @returns   options
   * @memberof WeChat  获取 资源的方法
   */
  fetchMaterial(token, mediaId, type, permanent) {
    let form = {};

    let url = api.temporary.fetch;
    if (permanent) {
      url = api.permanent.fetch;
    }

    let url = fetchUrl + 'access_token=' + token
    let options = { method: 'POST', url }

    if (permanent) {
      form.media_id = mediaId
      form.access_token = token
      options.body = form
    } else {
      if (type === 'video') {
        url = url.replace('https:', 'http:')
      }

      url += '&media_id=' + mediaId
    }

    return options

  }
  // 删除素材
  deleteMaterial(token, mediaId) {
    const form = {
      media_id: mediaId
    }
    const url = `${api.permanent.deletal}access_token=${token}&media_id=${mediaId}`

    return { method: 'POST', url, body: form }
  }

  // 更新素材
  updateMaterial(token, mediaId, news) {
    let form = {
      media_id: mediaId
    }
    form = Object.assign(form, news)

    const url = `${api.permanent.updateNews}access_token=${token}&media_id=${mediaId}`

    return { method: 'POST', url, body: form }
  }

  // 获取素材总数
  countMaterial(token) {
    const url = `${api.permanent.count}access_token=${token}`

    return { method: 'POST', url }
  }

  // 获取素材列表
  batchMaterial(token, options) {
    options.type = options.type || 'image'
    options.offset = options.offset || 0
    options.count = options.count || 10

    const url = `${api.permanent.batch}access_token=${token}`

    return { method: 'POST', url, body: options }
  }
}

module.exports = WeChat;
