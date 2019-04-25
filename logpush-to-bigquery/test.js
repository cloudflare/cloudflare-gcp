const {BigQuery} = require('@google-cloud/bigquery');
const bigquery = new BigQuery();
const dataset = bigquery.dataset('cloudflare_logs');

const table = dataset.table('recent_events');



module.exports = table.getMetadata().then((data) => {
	console.log(data[0].numRows, data[1])
	return data
}).catch(e => console.log(e))
