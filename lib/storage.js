const Monitor = require('@alife/refly-monitor')
const mid = function () {
  const reg = /(^| )last_mid=([^;]*)(;|$)/
  const arr = document.cookie.match(reg)
  if (arr) {
    return arr[2]
  }
  return '$_stranger_$'
}()
/**
 * PROTOCOL_VERSION use to check the storage version
 */
const PROTOCOL_VERSION = 1
const _ = {}
let keys = []
//获取localstorage中所有key值，每个key都以相同格式包含一定的信息
function init() {
  keys = Object.keys(window.localStorage)
}
//判断是否能够使用localStorage
function compat() {
  if (window.localStorage) return true
  return false
}
//将传入的数据,转化成localstorage中储存的key的格式,以便在localstorage中寻找
function getTarget(key, level) {
  return level > 3 ?
    `refly${level}\u2702$_SYSTEM_$\u2702${key}\u2702` :
    `refly${level}\u2702${mid}\u2702${key}\u2702`
}
//将localstorage中原来的key移除
function removeKeys(keyList) {
  for (let i = 0, l = keyList.length; i < l; i++) {
    const key = keyList[i]
    const index = keys.indexOf(key)
    if (index >= 0) keys.splice(index, 1)
    localStorage.removeItem(key)
  }
}
//在localstorage的所有key中寻找传入数据形成的key是否存在,存在就返回该key,不存在返回false
function has(key, level = 1) {
  const target = getTarget(key, level)
  for (let i = 0, l = keys.length; i < l; i++) {
    if (keys[i].indexOf(target) === 0) {
      return keys[i]
    }
  }
  return false
}
//搜集localstorage中待移除的key
function removeAll(key, level) {
  const target = getTarget(key, level)
  const removeList = []
  for (let i = 0, l = keys.length; i < l; i++) {
    if (keys[i].indexOf(target) === 0) {
      removeList.push(keys[i])
    }
  }
  removeKeys(removeList)
}
//移除比所需数据等级低的数据
function removeDate(level) {
  const removeList = []
  if (level > 4) {
    keys.length = 0
    localStorage.clear()
    return
  } else if (level === 0) {
    const reg = /refly[1-3]\u2702([^\u2702]+)/
    for (let i = 0, l = keys.length; i < l; i++) {
      const match = keys[i].match(reg)
      if (
        match && 
        match[1] !== mid // 不属于该用户
      ) {
        removeList.push(keys[i])
      }
    }
  } else {
    const target = `refly${level}\u2702`
    for (let i = 0, l = keys.length; i < l; i++) {
      if (keys[i].indexOf(target) === 0) {
        removeList.push(keys[i])
      }
    }
  }
  removeKeys(removeList)
}
//将数据保存到localStorage
function save2Local(key, level, value, removeLevel) {
  value = { r: value, v: PROTOCOL_VERSION }
  setTimeout(() => {
    removeAll(key, level)//将原来localstorage中的数据清空
    const json = JSON.stringify(value)
    if (json.length > 100000) { //判断是否超出了localstorage的容量
      Monitor.log('warn', `[API_REPONSE_TOO_BIG]${key}`)
      return // too larget to cache
    }
    const k = `${getTarget(key, level)}${+new Date}`
    try {
      localStorage[k] = json
      keys.push(k)
    } catch(e) {
      if (removeLevel <= level) { //循环移除数据等级小于level的所有等级数据
        removeDate(removeLevel)
        save2Local(key, level, value, removeLevel++)
      }
    }
  }, 0)
}
//保存数据
function save(key, level = 1, value) {
  if (typeof value !== 'object') return // no need cache other type
  _[key] = value // save to memory 保存副本，从副本读数据即从内存读数据会比直接从localstorage中读数据要快
  save2Local(key, level, value, 0)
}
//在localstorage中根据key找到请求数据
function get(key) {
  const arr = key.split('\u2702')
  let res
  // try to get memory data
  if (arr > 3) res = _[arr[2]]
  if (!res) {
    try {
      res = JSON.parse(localStorage[key])
      if (res.v === PROTOCOL_VERSION) {
        res = res.r
      } else {
        removeKeys([key])
        res = false
      }
    } catch(e) {
      keys.length = 0
      localStorage.clear() // cannot get clear all localStorage
      res = false
    }
  }
  return res
}

module.exports = {
  init, // 初始化数据
  compat, // 检查是否兼容
  has, // 是否有对应数据 
  save, // 存储对应数据
  get // 获取对应数据
}