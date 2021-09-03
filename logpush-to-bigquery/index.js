const { Storage }  = require('@google-cloud/storage');
const { BigQuery } = require('@google-cloud/bigquery');
const { PubSub }   = require('@google-cloud/pubsub');

const bigquery = new BigQuery();
const pubsub   = new PubSub();
const storage  = new Storage();

const bucket    = storage.bucket(process.env.BUCKET_NAME);
const fileSub   = pubsub.subscription(process.env.FILE_SUBSCRIPTION_NAME);
const fileTopic = pubsub.topic(process.env.FILE_TOPIC_NAME);

async function gcsbq (files) {
  const schema = require(`./${process.env.SCHEMA}`);
  const datasetId = process.env.DATASET;
  const tableId = process.env.TABLE;
  /* Configure the load job and ignore values undefined in schema */
  const metadata = {
    sourceFormat: 'NEWLINE_DELIMITED_JSON',
    schema: {
      fields: schema
    },
    ignoreUnknownValues: true
  };

  try {
    const [dataset] = await bigquery.dataset(datasetId).get({ autoCreate: true });
    const [table] = await dataset.table(tableId).get({ autoCreate: true });
    return table.createLoadJob(files, metadata)
  } catch (err) {
    console.error(err);
  }
}

async function getFilesFromPubSub (timeout=30) {
  return new Promise((resolve) => {
    var messageCount = 0;
    var fileNames = [];

    const messageHandler = message => {
      //console.log(`Received message ${message.id}:`);
      //console.log(`\tData: ${message.data}`);
      //console.log(`\tAttributes: ${message.attributes}`);
      messageCount += 1;
      // Limit the files we pull to the max # of source URIs allowed in BigQuery Load Jobs
      // See: https://cloud.google.com/bigquery/quotas#load_jobs
      if (messageCount > 10000) return;
      fileNames.push(message.data.toString());
      message.ack();
    };

    fileSub.on('message', messageHandler);
  
    setTimeout(() => {
      fileSub.removeListener('message', messageHandler);
      console.log(`${messageCount} message(s) received.`);
      resolve(fileNames);
    }, timeout * 1000);
  });
}

module.exports.runLoadJob = async function (message, context) {
  // We don't need to use the `message` or `context` here since we're just getting triggered by Cloud Scheduler
  // Get new file names from PubSub populated by `runNewFiles` and batch load them into BigQuery
  try {
    const fileNames = await getFilesFromPubSub();
    if (fileNames.length > 0) {
      console.log(`Received files from PubSub: ${fileNames}`);
      const [bqJob] = await gcsbq(fileNames.map(fileName => bucket.file(fileName))); 
      console.log(`Submitted BigQuery Job id: '${bqJob.id}'`);
    }
  } catch (err) {
    console.error(err)
  }
}

module.exports.runNewFiles = async function (file, context) {
  // This function is triggered by `google.storage.objects.finalize` on the GCS bucket for Logpush
  // Push file names into shared PubSub queue for consumption by separately scheduled `runLoadJob` function
  console.log(`Detected new file: ${file.name}`)
  try {
    const messageId = await fileTopic.publish(Buffer.from(file.name));
    console.log(`Message ${messageId} published.`);
  } catch(err) {
    console.error(err)
  }
}
