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
      console.log(data);
      reply = {
        type: 'image',
        mediaId: data.media_id
      }
    }
    ctx.body = reply;
  }
  await next();
}
