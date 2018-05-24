# GCS To Big Query Cloud Function
Google Cloud Function to process `json` files in Google Cloud Storage and push them to BigQuery

### Requirements
* If you're using the Google Cloud UI to upload then there are no local requirements.
* If you're working with this package locally, then the [gcloud SDK](https://cloud.google.com/sdk/downloads) needs to be installed.


### Setup
Environment variables (`config.json`):
* `DATASET`: BigQuery dataset to write to. Will be created if necessary.
* `TABLE`: BigQuery table to write to. Will be created if necessary.
   
When deploying via gcloud CLI or in Google Cloud UI, specify the following:
* `name`: any name can be used, but if entry-point is not specified then the function name will be used.
* `trigger-bucket`: the Google Storage Bucket that will trigger the Cloud Function on file upload. Must already exist.
* `stage-bucket`: the Google Cloud Storage location where the Cloud Function code will be hosted. This should *not* be the same as trigger bucket.
* `entry-point`: Should always be "jsonLoad"

### Deploying from gcloud cli

```bash
gcloud beta functions deploy <name of the cloud function> 
--trigger-resource=<trigger-bucket-name> --trigger-event google.storage.object.finalize 
--source=<path to gcsToBigQuery repository on your workstation> --stage-bucket=<gs://gcs-bucket> 
--entry-point=jsonLoad
```
