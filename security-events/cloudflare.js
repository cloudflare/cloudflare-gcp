require('env-yaml').config()
const fetch = require('node-fetch')
const moment = require('moment')
const LRU = require('quick-lru')
const securityCenter = require('@google-cloud/security-center')
const fields = require('./static/fields.json')

const lru = new LRU({
  maxSize: 200
})

const cacheHandler = {
  get (target, prop, receiver) {
    return Reflect.get(...arguments)
  },
  set (obj, prop, value) {
    return Reflect.set(...arguments)
  }
}

const Cache = {
  colos: new Proxy(lru, cacheHandler),
  assets: new Proxy(lru, cacheHandler)
}

const sccClient = new securityCenter.SecurityCenterClient({
  keyFilename: 'scc_key.json'
})

const CloudflareClient = {
  getJson: async ({
    params,
    path
  }, method = 'GET') => {
    let headers = {
      'Content-Type': 'application/json',
      'Authorization': process.env.API_KEY.startsWith('Bearer') ? process.env.API_KEY : `Bearer ${process.env.API_KEY}`
    }
    if (params) {
      // params = `?${Object.entries(params).map(arr => arr = `${arr[0]}=${arr[1]}`).join('&')}`
      params = new URLSearchParams(params).toString()
      params = decodeURIComponent(params)
      console.log(params)
    } else {
      params = ''
    }
    try {
      let uri = `https://api.cloudflare.com/client/v4${path}?${params}`.trimEnd()
      let response = await fetch(uri, { headers, method })
      // console.log(await response.json())
      return await response.json()
    } catch (e) {
      return JSON.stringify({ err: e })
    }
  },

  getDate: ({ minutes = null }) => {
    let m = moment()
    m.startOf('minute')
    if (typeof minutes === 'string') minutes = minutes.replace('m', '')
    if (minutes) m.subtract(parseInt(minutes, 10), 'minutes')
    return m.toISOString().replace('.000', '')
  },

  getColo (edgeColoID) {
    let id = Number.parseInt(edgeColoID, 10)
    let colos = require('./static/colos.json')
    let inCache = Cache.colos.has(edgeColoID)

    if (!inCache) {
      if (edgeColoID <= 172) {
        Cache.colos.set(edgeColoID, String(colos[id].colo_alias))
        return Cache.colos.get(edgeColoID)
      }

      const inChina = colos.slice(172).findIndex(colo => colo.colo_id === edgeColoID)

      if (inChina > -1) {
        Cache.colos.set(edgeColoID, String(colos[id].colo_alias))
        return Cache.colos.get(edgeColoID)
      }

      return 'San Francisco, CA'
    }
    return Cache.colos.get(edgeColoID)
  },

  firewallEvents: async function ({ zone }) {
    try {
      let res = await this.getJson({
        params: {
          kind: 'firewall',
          limit: '1000',
          mode: '!=whitelist',
          since: this.getDate({ minutes: process.env.INTERVAL }),
          until: this.getDate({ minutes: 0 })
        },
        path: `/zones/${zone}/security/events`
      })
      return res
    } catch (e) {
      console.log(`Error`, JSON.stringify(e, null, 2))
    }
  },

  elsEvents: async function ({ zone }) {
    try {
      let res = await this.getJson({
        params: {
          fields: 'RayID,ClientRequestHost,ClientRequestMethod,ClientRequestURI,ClientCountry,EdgeColoID,ClientIP,ClientASN,ClientDeviceType,EdgeResponseStatus,EdgePathingStatus,EdgePathingSrc,ClientRequestBytes,ClientSSLCipher,ClientRequestUserAgent,ClientRequestReferer',
          start: this.getDate({ minutes: parseInt(process.env.INTERVAL, 10) + 15 }),
          end: this.getDate({ minutes: 15 })
        },
        path: `/zones/${zone}/logs/received`
      })
      return res
    } catch (e) {
      console.log(`Error`, e)
    }
  },

  formatQraphQLFinding: async function (log, asset) {
    if (Reflect.has(log, 'err')) {
      return console.log(log)
    }

    let category
    if (Reflect.has(log, 'source') && Reflect.has(log, 'rule_id')) {
      category = `${log.source} - ${log.rule_id}`
    } else if (Reflect.has(log, 'source')) {
      category = log.source
    } else {
      category = 'Cloudflare'
    }

    if (!asset) {
      asset = log.host
    }

    let eventTime = new Date(log.occurred_at)
    console.log(`Logging finding ... ${process.env.SOURCE_ID}/findings/${log.ray_id}`)

    let finding = {
      updateMask: {
        paths: ['event_time', 'source_properties']
      },
      name: `${process.env.SOURCE_ID}/findings/${log.ray_id}`,
      externalUri: `https://dash.cloudflare.com/firewall`,
      state: 'ACTIVE',
      resourceName: asset,
      category: category,
      eventTime: {
        seconds: Math.floor(eventTime.getTime() / 1000),
        nanos: (eventTime.getTime() % 1000) * 1e6
      },
      sourceProperties: {
        Action: {
          stringValue: log.action,
          kind: 'stringValue'
        },
        Source: {
          stringValue: log.source,
          kind: 'stringValue'
        },
        Country: {
          stringValue: log.country,
          kind: 'stringValue'
        },
        Protocol: {
          stringValue: log.proto,
          kind: 'stringValue'
        },
        Method: {
          stringValue: log.method,
          kind: 'stringValue'
        },
        Host: {
          stringValue: log.host,
          kind: 'stringValue'
        },
        Agent: {
          stringValue: log.ua,
          kind: 'stringValue'
        },
        Path: {
          stringValue: log.uri,
          kind: 'stringValue'
        },
        Location: {
          stringValue: this.getColo(log.EdgeColoID),
          kind: 'stringValue'
        },
        Rule: {
          stringValue: log.rule_id,
          kind: 'stringValue'
        }
      }
    }
    await sccClient.updateFinding({ finding })
  },

  formatELSFinding: async function (log) {
    if (Reflect.has(log, 'err')) return console.log(log)
    console.log(log)
    let finding = {
      updateMask: {
        paths: ['source_properties']
      },
      name: `${process.env.SOURCE_ID}/findings/${log.RayID}`,
      sourceProperties: {
        Device: {
          stringValue: log.ClientDeviceType,
          kind: 'stringValue'
        },
        EdgePathingSignature: {
          stringValue: `${log.EdgePathingStatus} ${log.EdgePathingSrc}`
        },
        ClientRequestBytes: {
          stringValue: log.ClientRequestBytes,
          kind: 'stringValue'
        },
        ClientSSLCipher: {
          stringValue: log.ClientSSLCipher,
          kind: 'stringValue'
        },
        UA: {
          stringValue: log.ClientRequestUserAgent,
          kind: 'stringValue'
        },
        Referer: {
          stringValue: log.ClientRequestReferer,
          kind: 'stringValue'
        }
      }
    }
    await sccClient.updateFinding({ finding })
  }
}

module.exports = CloudflareClient
