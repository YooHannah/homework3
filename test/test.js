const assert = require('assert')
const $ = require('jquery')
let storage = require('../lib/storage')
let DB = require('../lib/core')
let MyDB;
describe('DB', function () {
   it('should able to use endpoint', (done) => {
        MyDB = class My extends DB {
            constructor(options) {
                super(options)
                this.plugin('endpoint', (options) => {
                    return () => {
                       const request = new XMLHttpRequest();
                        return new Promise((resolve, reject) => {
                        request.onreadystatechange = function () {
                          if (request.readyState === 4) {
                              if (request.status === 200) {
                                var temp = request.response;
                                temp=JSON.parse(temp)
                                  resolve({ret:temp.retcode});
                              } else {
                                  reject(request.status);
                              }
                          }
                      };
                      request.open(options.method, options.url, true)
                      request.send(null)
                        })
                    }
                })
            }
        }

        const myDB = new MyDB({ ret: 321, url: 'http://localhost:3000/hello/hannah' })
        myDB.get(null, { nocache: true })
            .done((data) => {
                data.ret.should.equal(1234)
                done()
            })
    })

    it('should able to throw error', (done) => {
        const myDB = new MyDB({ ret: 321, url: 'http://localhost:3000/hello/hannah' })

        myDB.get(null, { nocache: true })
            .done((data) => {
                xxxx; // throw an error
            })
            .catch(e => { //cache.js  plugin resolve 的try...catch 的catch throw e， 在catchHelper的try...catch中fire defer.catCbs
                e.message.should.equal('DB(http://localhost:3000/hello/hannah) xxxx is not defined')
                done()
            })
    })

    it('should able to use jQuery.Defer', (done) => {
        DDB = class MyDB extends DB {
            constructor(options) {
                super(options)
                this.plugin('endpoint', () => {
                    return () => {
                        const defer = $.Deferred()
                        setTimeout(() => {
                            defer.resolve({ ret: 123 })
                        })
                        return defer
                    }
                })
                this.plugin('judge', (data) => {
                    return true
                })
            }
        }

        const dDB = new DDB

        dDB.get(null, { nocache: true })
            .done(data => {
                done()
            })
    })

    it('should able to throw error when using jQuery.Defer', (done) => {
        const dDB = new DDB({ ret: 321, url: 'ppp://321' })

        dDB.get(null, { nocache: true })
            .done((data) => {
                xxxx; // throw an error
            }).catch(e => {
                e.message.should.equal('DB(ppp://321) xxxx is not defined')
                done()
            })
    })

    it('should able to use judge', (done) => {
        class XDB extends DB {
            constructor(options) {
                super(options)
                this.plugin('endpoint', () => {
                    return () => {
                        return new Promise((resolve, reject) => {
                            setTimeout(() => {
                                resolve({ hasError: true })
                            })
                        })
                    }
                })
                this.plugin('judge', (data) => {
                    if (data.hasError) return false
                    return true
                })
            }
        }

        const xDB = new XDB

        xDB.get()
            .fail(e => {
                e.hasError.should.ok()
                done()
            })
    })

    it('should able to use error plugin', (done) => {
        class XDB extends DB {
            constructor(options) {
                super(options)
                this.plugin('endpoint', () => {
                    return () => {
                        return new Promise((resolve, reject) => {
                            setTimeout(() => {
                                resolve({ hasError: true })
                            })
                        })
                    }
                })
                this.plugin('judge', (data) => {
                    if (data.hasError) return false
                    return true
                })
                this.plugin('error', (data) => {
                    return {
                        data
                    }
                })
            }
        }

        const xDB = new XDB

        xDB.get()
            .fail(e => {
                e.data.hasError.should.ok()
                done()
            })
    })
    })

    describe('defer error', () => {
        let db
        before(() => {
            window._ENV_ = 'dev'
        })

        it('should throw an error when have not use fail method to listen the error', (done) => {
            class XDB extends DB {
                constructor(options) {
                    super(options)
                    this.plugin('endpoint', () => {
                        return () => {
                            return new Promise((resolve, reject) => {
                                setTimeout(() => {
                                    resolve({ hasError: true })
                                })
                            })
                        }
                    })
                    this.plugin('judge', (data) => {
                        if (data.hasError) return false
                        return true
                    })
                }
            }

            const xDB = new XDB({ url: 'kk://123' })

            xDB.get({ nocache: true })
                .catch((e) => {
                    e.message.should.equal('You need use fail method to get the error: {"hasError":true}')
                    done()
                })
        })

        after(() => {
            window._ENV_ = undefined
            delete window._ENV_
        })
    })


    describe('cache default', () => {
        let db
        before((done) => {
            db = new MyDB({ ret: 123, url: 'http://localhost:3000/hello/hannah' })
            db.get()
                .done((data) => {
                    data.ret.should.equal(1234)
                    done()
                })
        })

        it('should able to use cache', (done) => {
            db.get()
                .done((data, flag) => {
                    if (flag) {
                        flag.should.equal('CACHE')
                        data.ret.should.equal(1234)
                        done()
                    } else {
                        data.ret.should.equal(1234)
                    }
                })
        })

        after((done) => {
            setTimeout(() => {
                localStorage.clear()
                done()
            }, 100)
        })
    })

     describe('cache lazy', () => {
        let db
        before((done) => {
            db = new MyDB({ ret: 123, url: 'http://localhost:3000/hello/hannah' })
            db.get()
                .done((data) => {
                    data.ret.should.equal(1234)
                    done()
                })
        })

        it('should able to use cache', (done) => {
            db.get(null, { lazy: true })
                .done((data, flag) => {
                    flag.should.equal('CACHE')
                    data.ret.should.equal(1234)
                    done()
                })
        })

        after((done) => {
            setTimeout(() => {
                localStorage.clear()
                done()
            }, 100)
        })
    })

    describe('cache refresh', () => {
        let db
        before((done) => {
            db = new MyDB({ ret: 123, url: 'http://localhost:3000/hello/hannah' })
            db.get()
                .done((data) => {
                    data.ret.should.equal(1234)
                    done()
                })
        })

        it('should able to use cache', (done) => {
            db.get(null, { refresh: 10000 })
                .done((data, flag) => {
                    flag.should.equal('CACHE')
                    data.ret.should.equal(1234)
                    done()
                })
        })

        it('should able to use cache', (done) => {
            db.get(null, { refresh: 10 })
                .done((data, flag) => {
                    if (flag) {
                        flag.should.equal('CACHE')
                        data.ret.should.equal(1234)
                        done()
                    } else {
                        data.ret.should.equal(1234)
                    }
                })
        })

        after((done) => {
            setTimeout(() => {
                localStorage.clear()
                done()
            }, 100)
        })
    })

     describe('cache lazy & refresh', () => {
        let db
        before((done) => {
            db = new MyDB({ ret: 123, url: 'http://localhost:3000/hello/hannah' })
            db.get()
                .done((data) => {
                    data.ret.should.equal(1234)
                    done()

                })
        })

        it('should able to use cache', (done) => {
            db.get(null, { lazy: true, refresh: 10000 })
                .done((data, flag) => {
                    flag.should.equal('CACHE')
                    data.ret.should.equal(1234)
                    done()
                })
        })

        it('should able to use cache', (done) => {
            db.get(null, { lazy: true, refresh: 1 })
                .done((data, flag) => {
                    (flag === undefined).should.be.ok()
                    data.ret.should.equal(1234)
                    done()
                })
        })

        after((done) => {
            setTimeout(() => {
                localStorage.clear()
                done()
            }, 100)
        })
    })
