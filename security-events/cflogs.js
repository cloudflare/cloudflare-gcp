'use-strict'

require('env-yaml').config()

const { getJson, getDate } = require('./util')
const { findings } = require('./findings')
const assets = require('./assets')
const ndjsonParser = require('ndjson-parse')

const cfLogs = {
  async firewallEvents ({ zone }) {
    try {
      let res = await getJson({
        params: {
          kind: 'firewall',
          limit: '1000',
          mode: '!=whitelist',
          since: getDate({ minutes: process.env.INTERVAL }),
          until: getDate({ minutes: 0 })
        },
        path: `/zones/${zone}/security/events`
      })
      return res
    } catch (e) {
      console.log(`Error`, JSON.stringify(e, null, 2))
    }
  },

  async elsEvents ({ zone }) {
    try {
      let res = await getJson({
        params: {
          fields: 'ClientASN,EdgePathingOp,ClientCountry,ClientDeviceType,ClientIP,ClientRequestBytes,ClientRequestHost,ClientRequestMethod,ClientRequestProtocol,ClientRequestReferer,ClientRequestURI,ClientRequestUserAgent,ClientSrcPort,ClientSSLCipher,ClientSSLProtocol,EdgeColoID,EdgeEndTimestamp,EdgePathingSrc,EdgePathingStatus,EdgeResponseBytes,EdgeResponseContentType,EdgeResponseStatus,EdgeStartTimestamp,OriginIP,OriginResponseStatus,RayID,WAFAction,WAFFlags,WAFMatchedVar,WAFProfile,WAFRuleID,WAFRuleMessage,FirewallMatchesRuleIDs,FirewallMatchesSources,FirewallMatchesActions',
          start: getDate({ minutes: parseInt(process.env.INTERVAL, 10) + 6 }),
          end: getDate({ minutes: 5 })
        },
        path: `/zones/${zone}/logs/received`,
        stream: true
      })

      const logs = ndjsonParser(res)

      for (const log of logs) {
        try {
          let evt = await log
          let isSecurityEvent = [
            'log',
            'simulate',
            'drop',
            'challenge',
            'jschallenge',
            'connectionClose'
          ].some(evtType => evt.FirewallMatchesActions.includes(evtType))
          if (evt.FirewallMatchesActions && Array.isArray(evt.FirewallMatchesActions)) {
            if (isSecurityEvent) {
              console.log(log.RayID)
              findings.format.els(log)
            }
          }
        } catch (e) {
          continue
        }
      }
    } catch (e) {
      console.log(`Error`, e)
    }
  },

  async getElsEvents () {
    const elsLogs = assets.zoneIds.map(async zoneId => {
      const elsEvents = await this.elsEvents({ zone: zoneId })
      return elsEvents
    })

    for (const latestFindings of elsLogs) {
      let findingsArr = await findings
      if (!findingsArr.result) {
        console.log('no new logs')
        continue
      }
      findingsArr.result.map(async finding => findings.format.els(latestFindings, assets.Shared[`${finding.host}`]))
    }
  },

  async getFwEvents () {
    const qraphQLLogs = assets.zoneIds.map(async zoneId => {
      const firewallEvents = await this.firewallEvents({ zone: zoneId })
      return firewallEvents
    })

    for (const latestFindings of qraphQLLogs) {
      let findingsArr = await findings
      if (!findingsArr.result) {
        console.log('no new logs')
        continue
      }
      findingsArr.result.map(async finding => findings.format.qraphQL(latestFindings, assets.Shared[`${finding.host}`]))
    }
  }
}

module.exports = cfLogs
