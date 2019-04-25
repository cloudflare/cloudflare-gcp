'use strict'

const { BigQuery } = require('@google-cloud/bigquery')
const { Storage } = require('@google-cloud/storage')
const storage = new Storage()

async function gcsbq (file, context) {
  const _schema = require(process.env.SCHEMA)

  const datasetId = process.env.DATASET
	const tableId = process.env.TABLE
	const d = new Date()
	const timestamp = d.toISOString().slice(0, 16).replace(/-|:/g, '')
	const tableIdTmp = process.env.TABLE + timestamp



  console.log(`Starting job for ${file.name}`)

	const filename = storage.bucket(file.bucket).file(file.name)

	/* Configure the load job and ignore values undefined in schema */
	const metadata = {
		sourceFormat: 'NEWLINE_DELIMITED_JSON',
		schema: {
			fields: _schema
		},
		ignoreUnknownValues: true
	}


  const addToTable = async (tableId) => {
		const dataset = bigquery.dataset(datasetId)
    return dataset.table(tableId).get({ autoCreate: true }, (e, table, res) => {
      table.load(filename, metadata)
    })
	}

  try {
    await addToTable(tableIdTmp)
    await addToTable(tableId)
  } catch (e) {
    console.log(e)
  }
}

// exports.gcsbq = gcsbq
