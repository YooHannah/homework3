module.exports = (opts) => {
  let name = `DB(${opts.url})`
  if (typeof opts._inject_ === 'object') {
    name = `Component(${opts._inject_.name}@${opts._inject_.version}).` + name
  }
  return name
}