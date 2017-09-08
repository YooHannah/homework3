var fn_hello = async (ctx, next) => {
    var name = ctx.params.name;
    ctx.response.body = {msg:'1234',retcode:0};
};

module.exports = {
    'GET /hello/:name': fn_hello
};