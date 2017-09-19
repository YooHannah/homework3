const storage = require('./storage')
// const $ = require('@alife/alpha-jquery')
const extend = require('extend')

// const Monitor = require('@alife/refly-monitor')
const formatName = require('./formatName')
//整理option数据，形成localStorage中的key
function parseData(data) {
  if (!data) return ''
  return Object.keys(data)
    .filter(v => v.charAt(0) !== '_')
    .sort()
    .reduce((res, cur) => {
      res.push(`${cur}=${data[cur]}`)
      return res
    }, [])
    .join('&')
}
//整理option数据，形成localStorage中的key
function parseKey(options) {
  const key = options.__key__ || `${options.url}?${parseData(options.data)}`
  options.__key__ = key
  return key
}
//从catch中返回请求数据
function fromCache(defer, options) {
  // prevent async bug
  const res = storage.get(options.hasCache) //在localstorage中根据key找到请求数据
  const p = new Promise((resolve, reject) => {
    setTimeout(() => {
      if (res) resolve(extend({ __flag__: 'CACHE' }, res))
    }, 0)
  })

  if (options.refresh && !options.lazy) {
    const hasCache = options.hasCache
    const lastTime = +hasCache.slice(hasCache.length - 13)
    // if has refresh, just break
    if (options.refresh > +new Date - lastTime) return p //如果上次数据获取时间到现在，没超过更新时限，则使用缓存数据
  }
  //向后台请求数据
  this.ajax(extend({}, options, { nocache: 'again', hasCache: false }), defer)
  return p
}
//根据option判断使用哪种缓存机制,不使用catch的话，返回false,否则返回在catch中的key
function hasCache(options) {
  // nocache
  if (options.nocache) return false
  const key = storage.has(parseKey(options), options.level)
  if (key && options.lazy && options.refresh) {
    const lastTime = +key.slice(key.length - 13)
    if (options.refresh < +new Date - lastTime) return false //数据太老，也不使用catch中的数据
  }
  return key
}

module.exports = function (inst) {
  if (storage.compat()) {
    storage.init()
    inst.plugin('options', function (options) {
      options.hasCache = hasCache(options)
      if (options.lazy && !options.refresh) {
        options.refresh = 86400000 // 1天
      }
      return options
    })
    inst.plugin('endpoint', function (options, defer) {
      if (options.hasCache) return fromCache.bind(inst, defer) //从catch中返回请求的数据
      // mark the start time
      options.__start__ = +new Date //计算请求需要时长
    })
    inst.plugin('resolve', function (res, opts, defer) {
      // use cache
      if ((!opts.nocache || opts.nocache === 'again') && !res.__flag__) {
        storage.save(parseKey(opts), opts.level, res) //将结果存进缓存
      }

      if (opts.nocache === 'again' && opts.lazy) {
        // nothing to do
      } else {
        try {
          defer.resolve(res, res.__flag__)
        } catch(e) {
          // replace message
          e.message = `${formatName(opts)} ${e.message}`
          console.log('error', e)
          throw e
        }
      }
    })
  }
}