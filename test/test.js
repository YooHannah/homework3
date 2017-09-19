const assert = require('assert')
let storage = require('../lib/storage')
let DB = require('../lib/core')


describe('DB', function () {
   it('should able to use endpoint', (done) => {
        MyDB = class My extends DB {
            constructor(options) {
                super(options)
                this.plugin('endpoint', () => {
                  console.log(11)
                    return () => {
                        return new Promise((resolve, reject) => {
                            setTimeout(() => {
                                resolve({ ret: this.options.ret})
                            })
                        })
                    }
                })
            }
        }

        const myDB = new MyDB({ ret: 321, url: 'ppp://321' })
        myDB.get(null, { nocache: false })
            .done((data) => {
                data.ret.should.equal(321)
                done()
            })
    })

})