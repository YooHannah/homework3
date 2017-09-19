const formatName = require('./formatName')

module.exports = (fn, defer, opts) => {
  const name = formatName(opts)
  return (arg) => {

    try {
      fn(arg)
    } catch(e) {
      const tmp = window['console']
      if (
        defer.catCbs.length === 0 &&
        tmp &&
        tmp.warn
      ) {
        tmp.warn(`${name} may have some error, please use catch method to catch error`)
        tmp.warn(e.toString())
      }
      defer.fire(defer.catCbs, e)
    }
  }
}