const mongoose = require('mongoose')
const Comment = mongoose.model('Comment')

exports.save = async (ctx, next) => {
  const commentData = ctx.request.body.comment
  // 如果带有一条cid，则说明有评论
  if (commentData.cid) {
    let comment = await Comment.findOne({
      _id: commentData.cid
    })

    const reply = {
      from: commentData.from,
      to: commentData.tid,
      content: commentData.content
    }

    comment.replies.push(reply)

    await comment.save()

    ctx.body = { success: true }
  } else {
    // 如果不是就对电影增加一条新的评论
    let comment = new Comment({
      movie: commentData.movie,
      from: commentData.from,
      content: commentData.content
    })

    await comment.save()

    ctx.body = { success: true }
  }
}
