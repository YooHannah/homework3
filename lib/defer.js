const noop = function () {}

class Defer {
  constructor(...defers) {
    this.sucCbs = []
    this.errCbs = []
    this.finCbs = []
    this.firstCbs = []
    this.secondCbs = []
    this.catCbs = []
    /**
     * status
     * 0 - no or fail
     * 1 - ready
     * 2 - cached value
     * 3 - real value
     */
    this.status = 0
    if (defers.length > 0) {
      Promise.all(defers.map(defer => defer._first()))
        .then((res) => {
          this.resolve(res, 'FIRST')
        }, (res) => {
          this.reject(res)
        })

      Promise.all(defers.map(defer => defer._sencond()))
        .then((res) => {
          this.resolve(res, 'SECOND')
        }, (res) => {
          this.reject(res)
        })
    }
  }
  done(cb) {
    this.sucCbs.push(cb)
    return this
  }
  fail(cb) {
    this.errCbs.push(cb)
    return this
  }
  final(cb) {
    this.finCbs.push(cb)
    return this
  }
  catch(cb) {
    this.catCbs.push(cb)
    return this
  }
  fire(cbs, res, flag) {
    for (let i = 0, l = cbs.length; i < l; i++) {
      cbs[i](res, flag)
    }
    return this
  }
  resolve(res, flag) {
    this.fire(this.sucCbs, res, flag)
      .fire(this.finCbs, res, flag)
    if (this.status) {
      // in cache
      if (flag && this.status === 1) {
        this.firstCbs[0] && this.firstCbs[0](res)
        this.status = 2
      } 

      // real value
      if (!flag) {
        if (this.status === 1) this.firstCbs[0] && this.firstCbs[0](res)
        this.secondCbs[0] && this.secondCbs[0](res)
        this.status = 3
      }
    }
  }
  reject(res, flag) {
    if (
      window._ENV_ === 'dev' && 
        this.errCbs.length === 0
    ) {
      throw new Error(`You need use fail method to get the error: ${JSON.stringify(res)}`)
    }
    this.fire(this.errCbs, res, flag)
      .fire(this.finCbs, res, flag)
    if (this.status) {
      if (this.status === 1) this.firstCbs[1] && this.firstCbs[1](res)
      else if (this.status === 2) this.secondCbs[1] && this.secondCbs[1](res)
      this.status = 0
    }
  }
  _first() {
    this._first = noop
    this.status = 1
    return new Promise((resolve, reject) => {
      this.firstCbs.push(resolve, reject)
    })
  }
  _sencond() {
    this._sencond = noop
    this.status = 1
    return new Promise((resolve, reject) => {
      this.secondCbs.push(resolve, reject)
    })
  }
}

module.exports = Defer