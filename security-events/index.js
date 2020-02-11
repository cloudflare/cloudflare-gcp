'use strict'

require('env-yaml').config()

const assets = require('./assets')
const cfLogs = require('./cflogs')

exports.FirewallEventsToSecurityCenter = async function (pubSubMessage, context) {
  try {
    if (pubSubMessage && 'data' in pubSubMessage) {
      console.log('Received pubsub trigger. Starting ...')
    }
    const sequence = (arr, input) => {
      arr.reduce(
        (promiseChain, currentFunction) => promiseChain.then(currentFunction),
        Promise.resolve(input)
      )
    }

    let pipeline = await sequence([
      await assets.getZoneIds(),
      // await assets.getLbHosts()
      await assets.getDnsRecords(),
      await assets.getGoogleResources(),
      await assets.updateAssetsFile(),
      await assets.getAssetsFile(),
      await cfLogs.getElsEvents(),
      await cfLogs.getFwEvents()
    ], 10)
    console.log(pipeline)
  } catch (e) {
    console.log(e)
  }
}
