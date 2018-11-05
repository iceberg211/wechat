
const request = require('request-promise');
const fs = require('fs');
const base = 'https://api.weixin.qq.com/cgi-bin/';
const mpBase = 'https://mp.weixin.qq.com/cgi-bin/';
const semanticUrl = 'https://api.weixin.qq.com/semantic/semproxy/search?'

const api = {
  accessToken: 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential',
  temporary: {
    upload: base + 'media/upload?',
    fetch: base + 'media/get?',
  },
  permanent: {
    upload: base + 'material/add_material?',
    uploadNew: base + 'material/add_news?',
    uploadNewsPic: base + 'media/uploadimg?',
    fetch: base + 'material/get_material?',
    batch: base + 'material/batchget_material?',
    count: base + 'material/get_materialcount?',
    deletal: base + 'material/del_material?',
    updateNews: base + 'material/update_news?',
  },

  tag: {
    create: base + 'tags/create?',
    fetch: base + 'tags/get?',
    update: base + 'tags/update?',
    del: base + 'tags/delete?',
    fetchUsers: base + 'user/tag/get?',
    batchTag: base + 'tags/members/batchtagging?',
    batchUnTag: base + 'tags/members/batchuntagging?',
    getUserTags: base + 'tags/getidlist?'
  },

  user: {
    fetch: base + 'user/get?',
    remark: base + 'user/info/updateremark?',
    infor: base + 'user/info?',
    batch: base + 'user/info/batchget?'
  },
  qrcode: {
    create: base + 'qrcode/create?',
    show: mpBase + 'showqrcode?',
  },

  shortUrl: {
    create: base + 'shorturl?',
  },

  ai: {
    translate: base + 'media/voice/translatecontent?'
  },
  semanticUrl,

  menu: {
    create: base + 'menu/create?',
    del: base + 'menu/delete?',
    custom: base + 'menu/addconditional?',
    fetch: base + 'menu/get?'
  },

  ticket: {
    get: base + 'ticket/getticket?'
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
    this.getTicket = opts.getTicket
    this.saveTicket = opts.saveTicket
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

  async fetchTicket(token) {
    let data = await this.getTicket()

    if (!this.isValid(data, 'ticket')) {
      data = await this.updateTicket(token)
    }

    await this.saveTicket(data)

    return data
  }

  // 获取 token
  async updateTicket(token) {
    const url = `${api.ticket.get}access_token=${token}&type=jsapi`

    const data = await this.request({ url })
    const now = new Date().getTime()
    const expiresIn = now + (data.expires_in - 20) * 1000

    data.expires_in = expiresIn

    return data
  }

  isValid(data, name) {
    if (!data || !data[name].expires_in) {
      return false
    }

    const expiresIn = data.expires_in
    const now = new Date().getTime()

    if (now < expiresIn) {
      return true
    } else {
      return false
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
      url = api.permanent.uploadNew
      form = material
    } else {
      form.media = fs.createReadStream(material)
    }

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

    // 取得参数
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
    let form = {}
    let fetchUrl = api.temporary.fetch

    if (permanent) {
      fetchUrl = api.permanent.fetch
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

  createTag(token, name) {
    const url = `${api.tag.create}access_token=${token}`;
    const form = {
      tag: {
        name,
      }
    }
    return { method: 'POST', url, body: form }
  }

  fetchTag(token) {
    const url = `${api.tag.fetch}access_token=${token}`;
    return { url };
  }

  /**
   * @param {*} token
   * @param {*} id
   * @param {*} name
   * @returns
   * @memberof WeChat  升级标签
   */
  updateTag(token, id, name) {
    const url = `${api.tag.update}access_token=${token}`;
    const form = {
      tag: {
        id,
        name,
      }
    }
    return { method: 'POST', url, body: form }
  }

  /**
 * @param {*} token
 * @param {*} id
 * @param {*} name
 * @returns
 * @memberof WeChat  删除标签
 */
  delTag(token, id) {
    const url = `${api.tag.del}access_token=${token}`;
    const form = {
      tag: {
        id,
      }
    }
    return { method: 'POST', url, body: form }
  }

  fetchTagUsers(token, tagid, openId) {
    const url = `${api.tag.fetchUsers}access_token=${token}`;
    const body = {
      tagid,
      next_openid: openId
    }
    return { method: 'POST', url, body }
  }


  /**
   *
   * 批量添加标签
   * @param {*} token
   * @param {*} openidList
   * @param {*} tagid
   * @param {*} unTag
   * @returns
   * @memberof WeChat
   */
  batchTag(token, openidList, tagid, unTag) {
    const body = {
      openid_list: openidList,
      tagid,
    }
    let url = !unTag ? api.tag.batchTag : api.tag.batchUnTag
    url += 'access_token=' + token

    return { method: 'POST', url, body }
  }

  // 获取粉丝列表
  fetchUserLists(token, openId) {
    // `${api.user.fetch}access_token=${token}&secret=${this.appSecret}`
    const url = `${api.user.fetch}access_token=${token}&next_openid=${openId}`;
    return { url }
  }

  // 给用户设置别名
  remark(token, openId, remark) {
    const url = `${api.user.remark}access_token=${token}`;
    const body = {
      openId,
      remark,
    }
    return { method: 'POST', url, body };
  }
  userInfor(token, openId, lang = "zh_CN") {
    const url = `${api.user.infor}access_token=${token}&openid=${openId}`;
    return { url }
  }

  // 创建二维码 Tikcker
  createQrcode(token, qr) {
    const url = `${api.qrcode.create}access_token=${token}`;
    const body = qr;
    return { method: 'POST', url, body };
  }
  // 通过Tikcker
  showQrcode(ticket) {
    const url = `${api.qrcode.show}ticket=${encodeURI(ticket)}`;
    return url;
  }

  // 长连接转短链接
  createShortUrl(token, action = 'long2short', longurl) {
    const url = api.shortUrl.create + 'access_token=' + token
    const body = {
      action,
      long_url: longurl
    }

    return { method: 'POST', url, body }
  }

  semantic(token, semanticData) {
    const url = api.semanticUrl + 'access_token=' + token
    semanticData.appid = this.appID

    return { method: 'POST', url, body: semanticData }
  }

  // AI 接口
  aiTranslate(token, body, lfrom, lto) {
    const url = api.ai.translate + 'access_token=' + token + '&lfrom=' + lfrom + '&lto=' + lto
    return { method: 'POST', url, body }
  }

  createMenu(token, menu, rules) {
    let url = api.menu.create + 'access_token=' + token

    if (rules) {
      url = api.menu.custom + 'access_token=' + token
      menu.matchrule = rules
    }

    return { method: 'POST', url, body: menu }
  }


  // 删除菜单
  deleteMenu(token) {
    const url = api.menu.del + 'access_token=' + token

    return { url }
  }

  // 获取菜单
  fetchMenu(token) {
    const url = api.menu.fetch + 'access_token=' + token

    return { url }
  }
}

module.exports = WeChat;
