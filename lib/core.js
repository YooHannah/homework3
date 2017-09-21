const Tapable = require('tapable')
// const $ = require('@alife/alpha-jquery')
const extend = require('extend')
const cache = require('./cache')
// const monitor = require('./monitor')
const Defer = require('./defer')
const catchHelper = require('./catch')

class Core extends Tapable {
  constructor(options) {
    super()
    this.options = extend({}, options || {}, this.constructor.defaultOptions)
    // 缓存组件
    cache(this)
    // 上报组件
    // monitor(this)
  }

  ajax(options, defer) {
    defer = defer || new Defer
    const opts = this.applyPluginsWaterfall('options', extend({}, this.options, options))
    // console.log(opts)
    this.applyPluginsBailResult('endpoint', opts, defer)(opts)
      .then(catchHelper(res => {
        const flag = this.applyPluginsBailResult('judge', res, opts) //judge不存在时，flag为undefined
        if (flag === false) {
          res = this.applyPluginsWaterfall('error', res, opts)
          defer.reject(res)
        } else {
          this.applyPlugins('resolve', res, opts, defer)
        }
      }, defer, opts), catchHelper(res => {
        res = this.applyPluginsWaterfall('error', res, opts)
        defer.reject(res)
      }, defer, opts))
    return defer
  }

  get(data = {}, options = {}) {
    options.method = 'GET'
    options.data = data
    return this.ajax(options)
  }

  post(data = {}, options = {}) {
    options.method = 'POST'
    options.data = data
    return this.ajax(options)
  }

  jsonp(data = {}, options = {}) {
    options.dataType = 'JSONP'
    options.data = data
    return this.ajax(options)
  }
}

module.exports = Core