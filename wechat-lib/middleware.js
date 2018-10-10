const sha1 = require('sha1');

/*
 * 暴露出中间件 
 *  next为串联中间件的的钩子函数
 */
module.exports = (congfig) => {
    return async(ctx, next) => {
        const { signature, timestamp, nonce, echostr } = ctx.query;
        const token = congfig.token;
        let string = [token, timestamp, nonce].sort().join('');
        const sha = sha1(string);

        if (ctx.method === 'GET') {
            if (sha === signature) {
                ctx.boby = echostr;
            } else {
                ctx.body = 'Faild';
            }
        } else if (ctx.method === 'POST') {
            if (sha !== signature) {
                ctx.boby = 'Faild'
            }
        }

    }
}