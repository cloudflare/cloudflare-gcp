const { Storage } = require('@google-cloud/storage')
const { BigQuery } = require('@google-cloud/bigquery')
const { Logging } = require('@google-cloud/logging')
const { DateTime } = require('luxon')

const storage = new Storage()
const bigquery = new BigQuery()
const logging = new Logging()
const log = logging.log('logpush-to-bigquery-sink')
const bucket = storage.bucket(process.env.BUCKET_NAME)

async function gcsbq (files) {
  const schema = require(`./${process.env.SCHEMA}`)
  const datasetId = process.env.DATASET
  const tableId = process.env.TABLE
  /* Configure the load job and ignore values undefined in schema */
  const metadata = {
    sourceFormat: 'NEWLINE_DELIMITED_JSON',
    schema: {
      fields: schema
    },
    ignoreUnknownValues: true
  }

  const addToTable = async tableId => {
    const dataset = await bigquery.dataset(datasetId).get({ autoCreate: true })
    const table = await dataset[0].table(tableId).get({ autoCreate: true })
    return table[0].createLoadJob(files, metadata)
  }

  try {
    return addToTable(tableId)
  } catch (e) {
    console.log(e)
  }
}

async function writeLog (logData) {
  logData = logData.reduce((acc, current) => [...acc, current.name], [])

  const metadata = {
    resource: { type: 'global' },
    severity: 'INFO'
  }

  const entry = log.entry(metadata, logData)
  await log.write(entry)
  console.log(
    `Loaded to ${process.env.DATASET}.${process.env.TABLE}: ${logData}`
  )
}

module.exports.runLoadJob = async function (message, context) {
  if (!context) {
    context = {}
    context.timestamp = new Date().toISOString()
  }
  context.timestamp = DateTime.fromISO(context.timestamp)

  const loadJobDeadline = context.timestamp
    .setZone('GMT')
    .minus({ minutes: 15 })
    .startOf('minute')

  const [deadlineDate, deadlineDt] = [
    loadJobDeadline.toFormat('yyyyMMdd'),
    loadJobDeadline.toFormat(`yyyyMMdd'T'hhmm`)
  ]

  let stackdriverEntry = []

  try {
    let logFiles = await bucket.getFiles({
      autoPaginate: false,
      maxResults: 5000,
      prefix: `${process.env.DIRECTORY}${deadlineDate}/${deadlineDt}`
    })
    logFiles = logFiles[0]

    if (logFiles.length < 1) {
      return console.log(`No new logs at ${deadlineDt}`)
    }

    await gcsbq(logFiles)
    await writeLog(logFiles)
  } catch (e) {
    console.log(e)
  }
}
