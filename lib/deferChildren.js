const defer = require('../lib/defer')
const request = require('request');
if (typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = require('node-localstorage').LocalStorage;
  localStorage = new LocalStorage('./scratch');
}
const deferChildren = new defer
deferChildren
  .done(
    function(){
      console.log(222)
      request('http://localhost:3000/hello/hannah', function (error, response, body) {
        console.log(3333)
        if (body.retcode == 0) {
          var nowtime = Date.now();
          var content = {
            gettime:nowtime,
            res:body
          }
          localStorage.setItem('loginpage', content);
        }
      })
  }
 )
  .fail(function(){
    console.log('fail')
  })

  .catch(function(e){
    console.log('have show error')
    console.log(e)
  })
module.exports = deferChildren