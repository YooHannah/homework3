var fn_index = async (ctx, next) => {
    // ctx.response.body ={
    //           retcode: 0, // 可以是0(正确)，1(登陆台丢失)等等
    //           msg: 'success', // 错误时候返回的信息
    //           res: `<h1>Index</h1>
    //           <form action="/signin" method="post">
    //           <p>Name: <input name="name" value="koa"></p>
    //           <p>Password: <input name="password" type="password"></p>
    //           <p><input type="submit" value="Submit"></p>
    //           </form>`
    //         }
    ctx.response.body = `<h1>Index</h1>
              <form action="/signin" method="post">
              <p>Name: <input name="name" value="koa"></p>
              <p>Password: <input name="password" type="password"></p>
              <p><input type="submit" value="Submit"></p>
              </form>`
    ctx.response.message='success';
    ctx.response.status= 200
};

var fn_signin = async (ctx, next) => {
    var
        name = ctx.request.body.name || '',
        password = ctx.request.body.password || '';
    console.log(`signin with name: ${name}, password: ${password}`);
    if (name === 'koa' && password === '12345') {
        ctx.response.body = `<h1>Welcome, ${name}!</h1>`;
    } else {
        ctx.response.body = `<h1>Login failed!</h1>
        <p><a href="/">Try again</a></p>`;
    }
};

module.exports = {
    'GET /': fn_index,
    'POST /signin': fn_signin
};