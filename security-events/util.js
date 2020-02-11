require('env-yaml').config()

const LRU = require('quick-lru')
const moment = require('moment')
const colos = require('./static/colos.json')
const request = require('node-fetch')
const { URLSearchParams } = require('url')

const Lru = new LRU({
  maxSize: 300
})

const lruCacheHandler = {
  get (target, prop, receiver) {
    return Reflect.get(...arguments)
  },
  set (obj, prop, value) {
    return Reflect.set(...arguments)
  }
}

const lru = {
  account: new Proxy(Lru, lruCacheHandler),
  colos: new Proxy(Lru, lruCacheHandler),
  assets: new Proxy(Lru, lruCacheHandler),
  zones: new Proxy(Lru, lruCacheHandler)
}

const getJson = async ({ params, path, body = null, stream = false }, method = 'GET') => {
  let headers = {
    'Content-Type': 'application/json',
    'Authorization': process.env.API_KEY.startsWith('Bearer') ? process.env.API_KEY : `Bearer ${process.env.API_KEY}`
  }
  if (params) {
    params = new URLSearchParams(params).toString()
    params = '?' + decodeURIComponent(params)
  } else {
    params = ''
  }
  try {
    let uri = `https://api.cloudflare.com/client/v4${path}${params}`.trimEnd()
    let options = {
      headers: headers,
      method: method
    }
    if (body) {
      options.body = body
    }
    let response = await request(uri, options)
    if (!response.ok) {
      throw console.log('')
    }

    if (stream) {
      return response.text()
    }
    return response.json()
  } catch (e) {
    return JSON.stringify({ err: e })
  }
}

const getDate = ({ minutes = null }) => {
  let m = moment()
  m.startOf('minute')
  if (typeof minutes === 'string') minutes = minutes.replace('m', '')
  if (minutes) m.subtract(parseInt(minutes, 10), 'minutes')
  const formatted = m.toISOString().replace('.000', '')
  console.log(formatted)
  return formatted
}

const getColo = (edgeColoID) => {
  let id = Number.parseInt(edgeColoID, 10)
  let inlru = lru.colos.has(edgeColoID)

  if (!inlru) {
    if (edgeColoID <= 172) {
      lru.colos.set(edgeColoID, String(colos[id].colo_alias))
      return lru.colos.get(edgeColoID)
    }

    const inChina = colos.slice(172).findIndex(colo => colo.colo_id === edgeColoID)

    if (inChina > -1) {
      lru.colos.set(edgeColoID, String(colos[id].colo_alias))
      return lru.colos.get(edgeColoID)
    }

    return 'San Francisco, CA'
  }
  return lru.colos.get(edgeColoID)
}

module.exports.getColo = getColo
module.exports.getDate = getDate
module.exports.getJson = getJson
module.exports.lru = lru
