'use strict'

const CSE = require('./cse')

module.exports.bqscc = async function (data, context) {
  const cse = await CSE.init()
  // console.log(await cse.rowsToStream())
  await cse.addFindings({
    queries: [
      './static/queries/no_waf.txt',
      './static/queries/waf.txt',
      './static/queries/rate_limit.txt'
    ]
  })
}
