const { resolve } = require('path');

/*
 * 回复策略，略傻瓜化
 */
exports.reply = async (ctx, next) => {

  // 通过文件引用，拿到实例，每一个请求都需要reply，必须
  let mp = require('./index');

  let client = mp.getWechat();

  const message = ctx.wexin;

  if (message.MsgType === 'text') {
    let content = message.Content;
    let reply = `你说的${content}太复杂了`
    if (content === '1') {
      reply = '星球大战'
    } else if (content === '2') {
      reply = '星球大战2'
    } else if (content === '3') {
      reply = '星球大战3'
    } else if (content === '4') {
      let data = await client.handle('uploadMaterial', 'image', resolve(__dirname, '../2.jpg'));
      reply = {
        type: 'image',
        mediaId: data.media_id
      }
    } else if (content === '5') {
      let data = await client.handle('uploadMaterial', 'video', resolve(__dirname, '../6.mp4'));
      reply = {
        type: 'video',
        title: '回复的视频标题',
        description: '测试视频',
        mediaId: data.media_id
      }
      // 永久视频上传
    } else if (content === '6') {
      let data = await client.handle('uploadMaterial', 'video', resolve(__dirname, '../6.mp4'), {
        type: 'video',
        description: '{"title": "永久视频上传", "introduction": "永久视频上传"}'
      });

      reply = {
        type: 'video',
        title: '永久视频上传 2',
        description: '永久视频上传',
        mediaId: data.media_id
      }
    } else if (content === '7') {
      let data = await client.handle('uploadMaterial', 'image', resolve(__dirname, '../2.jpg'), {
        type: 'image'
      });
      reply = {
        type: 'image',
        mediaId: data.media_id
      }
      // 图文消息
    } else if (content === '8') {
      let data = await client.handle('uploadMaterial', 'image', resolve(__dirname, '../2.jpg'), {
        type: 'image'
      })
      let data2 = await client.handle('uploadMaterial', 'pic', resolve(__dirname, '../2.jpg'), {
        type: 'image'
      })
      const media = {
        articles: [{
          title: '这是图文标题',
          thumb_media_id: data.media_id,
          author: '何炜',
          digest: '这是图文宅摘要',
          show_cover_pic: 1,
          content: '点击前往易订货',
          content_source_url: 'www.dinghuo123.com'
        }, {
          title: 'github',
          thumb_media_id: data2.media_id,
          author: '何炜',
          digest: '这是图文宅摘要',
          show_cover_pic: 1,
          content: 'github',
          content_source_url: 'www.github.com'
        }]
      }

      // 先上传
      let uploadData = await client.handle('uploadMaterial', 'news', media, {})
      let newMedia = {
        media_id: uploadData.media_id,
        index: 0,
        articles: {
          title: '这是服务端上传的图文 1',
          thumb_media_id: data.media_id,
          author: 'Scott',
          digest: '没有摘要',
          show_cover_pic: 1,
          content: '点击去往慕课网',
          content_source_url: 'http://coding.imooc.com/'
        }
      }

      let mediaData = await client.handle('updateMaterial', uploadData.media_id, newMedia)


      let newsData = await client.handle('fetchMaterial', uploadData.media_id, 'news', true);
      let items = newsData.news_item
      let news = []

      items.forEach(item => {
        news.push({
          title: item.title,
          description: item.description,
          picUrl: data2.url,
          url: item.url
        })
      })

      reply = news;

      // 总数查询
    } else if (content === '9') {

      // 查共总的数量
      let count = await client.handle('countMaterial');

      let res = await Promise.all([
        client.handle('batchMaterial', {
          type: 'image',
          offset: 0,
          count: 10
        }),
        client.handle('batchMaterial', {
          type: 'video',
          offset: 0,
          count: 10
        }),
        client.handle('batchMaterial', {
          type: 'voice',
          offset: 0,
          count: 10
        }),
        client.handle('batchMaterial', {
          type: 'news',
          offset: 0,
          count: 10
        })
      ])

      console.log(res)
      reply = `
        image: ${res[0].total_count}
        video: ${res[1].total_count}
        voice: ${res[2].total_count}
        news: ${res[3].total_count}
      `
    } else if (content === '获取标签') {
      //  参数个数
      let tags = await client.handle('fetchTag');


      reply = tags.tags.length;
    } else if (content === '10') {

      let userList = await client.handle('fetchUserLists', '');

      console.log(userList);

      reply = `${userList.total}个关注者`;

    } else if (content === '12') {

      const remark = await client.handle('remark', message.FromUserName, '何炜');

      reply = `改名成功`;
    }
    else if (content === '用户信息') {

      const userInfor = await client.handle('userInfor', message.FromUserName);

      reply = JSON.stringify(userInfor);
    }
    else if (content === '批量获取用户信息') {

      const userInfor = await client.handle('userInfor', message.FromUserName);

      reply = JSON.stringify(userInfor);
    }
    else if (content === '二维码') {
      // expire_seconds 去掉 expire_seconds就是永久二维码
      let temQr = {
        expire_seconds: 604800,
        action_name: "QR_SCENE",
        action_info:
          { scene: { scene_id: 123 } }
      }
      // 拿到二维码
      const temcode = await client.handle('createQrcode', temQr);

      // 生成二维码
      const temQrcode = client.showQrcode(temcode.ticket);
      reply = temQrcode;
    } else if (content === '16') {
      let longurl = 'https://coding.imooc.com/class/178.html?a=1'
      let shortData = await client.handle('createShortUrl', 'long2short', longurl)

      console.log(shortData)

      reply = shortData.short_url
    } else if (content === '17') {
      let semanticData = {
        query: '查一下明天从杭州到北京的南航机票',
        city: '杭州',
        category: 'flight,hotel',
        uid: message.FromUserName
      }
      let searchData = await client.handle('semantic', semanticData)

      console.log(searchData)

      reply = JSON.stringify(searchData)
    } else if (content === '18') {
      let body = '编程语言难学么'
      let aiData = await client.handle('aiTranslate', body, 'zh_CN', 'en_US')

      console.log(aiData)

      reply = JSON.stringify(aiData)
    } else if (content === '19') {
      try {
        let delData = await client.handle('deleteMenu')
        console.log(delData)
        let menu = {
          button: [
            {
              name: '一级菜单',
              sub_button: [
                {
                  name: '二级菜单 1',
                  type: 'click',
                  key: 'no_1'
                }, {
                  name: '二级菜单 2',
                  type: 'click',
                  key: 'no_2'
                }, {
                  name: '二级菜单 3',
                  type: 'click',
                  key: 'no_3'
                }, {
                  name: '二级菜单 4',
                  type: 'click',
                  key: 'no_4'
                }, {
                  name: '二级菜单 5',
                  type: 'click',
                  key: 'no_5'
                }
              ]
            },
            {
              name: '分类',
              type: 'view',
              url: 'https://www.imooc.com'
            },
            {
              name: '新菜单_' + Math.random(),
              type: 'click',
              key: 'new_111'
            }
          ]
        }
        let createData = await client.handle('createMenu', menu)
        console.log(createData)
      } catch (e) {
        console.log(e)
      }

      reply = '菜单创建成功，请等 5 分钟，或者先取消关注，再重新关注就可以看到新菜单'
    } else if (content === '20') {
      try {
        // let delData = await client.handle('deleteMenu')
        let menu = {
          button: [
            {
              name: 'Scan_Photo',
              sub_button: [
                {
                  name: '系统拍照',
                  type: 'pic_sysphoto',
                  key: 'no_1'
                }, {
                  name: '拍照或者发图',
                  type: 'pic_photo_or_album',
                  key: 'no_2'
                }, {
                  name: '微信相册发布',
                  type: 'pic_weixin',
                  key: 'no_3'
                }, {
                  name: '扫码',
                  type: 'scancode_push',
                  key: 'no_4'
                }, {
                  name: '等待中扫码',
                  type: 'scancode_waitmsg',
                  key: 'no_5'
                }
              ]
            },
            {
              name: '跳新链接',
              type: 'view',
              url: 'https://www.imooc.com'
            },
            {
              name: '其他',
              sub_button: [
                {
                  name: '点击',
                  type: 'click',
                  key: 'no_11'
                }, {
                  name: '地理位置',
                  type: 'location_select',
                  key: 'no_12'
                }
              ]
            }
          ]
        }
        let rules = {
          // "tag_id": "2",
          // "sex": "1",
          // "country": "中国",
          // "province": "广东",
          // "city": "广州",
          // "client_platform_type": "2",
          language: 'en'
        }
        await client.handle('createMenu', menu, rules)
      } catch (e) {
        console.log(e)
      }

      let menus = await client.handle('fetchMenu')

      console.log(JSON.stringify(menus))

      reply = '菜单创建成功，请等 5 分钟，或者先取消关注，再重新关注就可以看到新菜单'
    }
    ctx.body = reply;
    // 获取地理位置，地理位置为事件类型
  } else if (message.MsgType === 'event') {
    let reply = ''
    if (message.Event === 'subscribe') {
      reply = '欢迎订阅' + '！ '

      if (message.EventKey && message.ticket) {
        reply += '扫码参数是：' + message.EventKey + '_' + message.ticket
      } else {
        reply = help
      }
    } else if (message.Event === 'VIEW') {
      console.log('你点击了菜单链接： ' + message.EventKey + ' ' + message.MenuId)
    } else if (message.Event === 'scancode_push') {
      console.log('你扫码了： ' + message.ScanCodeInfo.ScanType + ' ' + message.ScanCodeInfo.ScanResult)
    } else if (message.Event === 'scancode_waitmsg') {
      console.log('你扫码了： ' + message.ScanCodeInfo.ScanType + ' ' + message.ScanCodeInfo.ScanResult)
    } else if (message.Event === 'pic_sysphoto') {
      console.log('系统拍照： ' + message.SendPicsInfo.count + ' ' + JSON.stringify(message.SendPicsInfo.PicList))
    } else if (message.Event === 'pic_photo_or_album') {
      console.log('拍照或者相册： ' + message.SendPicsInfo.count + ' ' + JSON.stringify(message.SendPicsInfo.PicList))
    } else if (message.Event === 'pic_weixin') {
      console.log('微信相册发图： ' + message.SendPicsInfo.count + ' ' + JSON.stringify(message.SendPicsInfo.PicList))
    } else if (message.Event === 'location_select') {
      console.log('地理位置： ' + JSON.stringify(message.SendLocationInfo))
    } else if (message.Event === 'unsubscribe') {
      reply = '无情取消订阅'
    } else if (message.Event === 'SCAN') {
      console.log('关注后扫二维码' + '！ 扫码参数' + message.EventKey + '_' + message.ticket)
    } else if (message.Event === 'LOCATION') {
      console.log(`您上报的位置是：${message.Latitude}-${message.Longitude}-${message.Precision}`)
    }
    ctx.body = reply;
  }
  await next();
}



