const Monitor = require('@alife/refly-monitor')

module.exports = function (inst) {
  inst.plugin('error', (res, opts) => {
    Monitor.reportState(opts.url, false)
    return res
  })
  inst.plugin('resolve', (res, opts) => {
    // report delay
    Monitor.reportState(opts.url, true, undefined, +new Date - opts.__start__)
    // when debug just log res
    Monitor.log('debug', { from: opts.url, msg: res })
  })
}