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
    }
    ctx.body = reply;
    await next();
    // 获取地理位置，地理位置为事件类型
  } else if (message.MsgType === 'event') {
    let reply = ''
    if (message.EVENT === 'LOCATION') {
      reply = `您上报的位置是:${message.Latitude}-${message.Longitude}-${message.Precision}`

    }
    ctx.body = reply;
  }
}



