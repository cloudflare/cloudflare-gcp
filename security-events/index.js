'use strict'

require('env-yaml').config()

const assets = require('./assets')
const cloudflareClient = require('./cloudflare')

exports.FirewallEventsToSecurityCenter = (async function () {
  await assets.getAccountId()
  await assets.getZoneIds()
  await assets.getLbHosts()
  await assets.getDnsRecords()
  await assets.getGoogleResources()
  await assets.updateAssetsFile()
  await assets.getAssetsFile()

  const qraphQLLogs = assets.zoneIds.map(async zoneId => {
    const firewallEvents = await cloudflareClient.firewallEvents({ zone: zoneId })
    return firewallEvents
  })

  const elsLogs = assets.zoneIds.map(async zoneId => {
    const elsEvents = await cloudflareClient.elsEvents({ zone: zoneId })
    return elsEvents
  })

  for (const findings of elsLogs) {
    let findingsArr = await findings
    if (!findingsArr.result) {
      return console.log('no new logs')
    }
    findingsArr.result.map(async finding => cloudflareClient.formatELSFinding(finding, assets.Shared[`${finding.host}`]))
  }

  for (const findings of qraphQLLogs) {
    let findingsArr = await findings
    if (!findingsArr.result) {
      return console.log('no new logs')
    }
    findingsArr.result.map(async finding => cloudflareClient.firewallEvents(finding, assets.Shared[`${finding.host}`]))
  }
})()
