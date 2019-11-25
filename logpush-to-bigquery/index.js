'use strict'

const { BigQuery } = require('@google-cloud/bigquery')
const { Storage } = require('@google-cloud/storage')
const bigquery = new BigQuery()
const storage = new Storage()

async function gcsbq (file, context) {
  const schema = require(process.env.SCHEMA)

  const datasetId = process.env.DATASET
  const tableId = process.env.TABLE

  console.log(`Starting job for ${file.name}`)

  if (file.name.includes('tableMeta')) return

  const filename = storage.bucket(file.bucket).file(file.name)

  /* Configure the load job and ignore values undefined in schema */
  const metadata = {
    sourceFormat: 'NEWLINE_DELIMITED_JSON',
    timePartitioning: {
      type: 'DAY',
      field: 'EdgeStartTimestamp'
    },
    schema: {
      fields: schema
    },
    ignoreUnknownValues: true
  }

  const addToTable = async (tableId) => {
    const dataset = await bigquery.dataset(datasetId).get({ autoCreate: true })
    const table = await dataset[0].table(tableId).get({ autoCreate: true })
    return table[0].load(filename, metadata)
  }

  try {
    await addToTable(tableId)
  } catch (e) {
    console.log(e)
  }
}

module.exports.gcsbq = gcsbq
