var fn_hello = async (ctx, next) => {
    var name = ctx.params.name;
    ctx.set('Access-Control-Allow-Origin', '*')
    ctx.response.body = {msg:'1234',retcode:1234};
};

module.exports = {
    'GET /hello/:name': fn_hello
};