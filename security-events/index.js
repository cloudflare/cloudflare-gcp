'use strict'
require('env-yaml').config()
const CSE = require('./cse')

module.exports.bqscc = async function (file, context) {
  if (file.name.includes('tableMeta')) return
  const cse = await CSE.init()
  await cse.addFindings({
    queries: [
      './static/queries/no_waf.txt',
      './static/queries/waf.txt',
      './static/queries/rate_limit.txt'
    ]
  })
}
