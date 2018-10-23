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
      let tags = await client.handle('fetchTag');

      reply = tags.tags.length;
    }

    ctx.body = reply;
  }
  await next();
}
