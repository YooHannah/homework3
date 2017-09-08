const deferChildren = require('../lib/deferChildren')
const assert = require('assert')
const request = require('request');
let DB = require('../lib/db')
// just for the real answer, please ignore
if (!DB.prototype.request) {
  DB = require('../lib/.db')
}

if (typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = require('node-localstorage').LocalStorage;
  localStorage = new LocalStorage('./scratch');
}

describe('GET', function () {
   it('可以根据不同的options，使用不同的endpoint', function (done) {
    class AA extends DB {
      constructor(options) {
        super(options)
        this.plugin('endpoint', function (options) {
          if (options.type === 0) {
            if(localStorage.getItem('loginpage')){
               deferChildren.resolve(0);
               deferChildren.resolve(0);
            }else{
              deferChildren.resolve(0);
            }
            return new Promise((resolve) => {
              setTimeout(() => {
                resolve({ retcode: deferChildren.time, msg: 'logout' })
              }, 0)
            })
          }
        })
        this.plugin('endpoint', function (options) {
          if (options.type === 1) {
             var res='';
             if(options.lazy){
                if(!localStrage.getItem('loginpage')){
                  deferChildren.resolve()
                  res = localStrage.getItem('loginpage');
                }else{
                  res = localStrage.getItem('loginpage');
                  deferChildren.resolve()
                }
              }
              if(!options.lazy){
                if(!localStrage.getItem('loginpage')){
                  deferChildren.resolve()
                  res = localStrage.getItem('loginpage');
                }else{
                  res = localStrage.getItem('loginpage');
                }
              }
            return new Promise((resolve) => {
              setTimeout(() => {
                resolve({ retcode: 0, res: { msg: 'hello world' } })
              }, 0)
            })
          }
        })

        this.plugin('endpoint', function (options) {
          if (options.type === 2) {
             var start=localStrage.getItem('loginpage').gettime;
             var now = Date.now();
            if(now-start>options.maxAge){
              deferChildren.resolve()
              res = localStrage.getItem('loginpage').res;
            }else{
              res = localStrage.getItem('loginpage').res;
            }
            return new Promise((resolve) => {
              setTimeout(() => {
                resolve({ retcode: 0, res: { msg: 'hello world' } })
              }, 0)
            })
          }
        })
      }
    }

    const aa = new AA
    aa.request({ type: 0 })
      .then(res => {
        assert.equal(res.retcode, 1)//如果没缓存，成功请求回调一次
        done()
        // return aa.request({ type: 0 })
      })
      // .then(res => {
      //   assert.equal(res.retcode, 2)//如果有请求成功缓存应当回调两次
      //    done()
      // })
  })

})