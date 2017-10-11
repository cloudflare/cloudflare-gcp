# GCS To Big Query Cloud Function
Google Cloud Function Code to push json files from GCS to Big Query

### Requirements
If using the Google Cloud UI to upload then there are no local requirements.

[gcloud SDK](https://cloud.google.com/sdk/downloads) need to be setup to run from command line.

### Setup
Config Variables:
   "DATASET" - BigQuery Dataset to write to. Will be created if necessaray.
   "TABLE" - BigQuery Table to write to. Will be created if necessaray.
   
When deploying through gcloud or in UI, the following need to be specified:
   * name: any name can be used, but if entry-point is not specified then the function name will be used.
   * trigger-bucket: The Google Storage Bucket that will trigger the Cloud Function on file create. Must already exist.
   * stage-bucket: Where the Cloud Function code should be kept. Should not be the same as trigger bucket in case you update the Cloud Function.
   * entry-point: Should always be "jsonLoad" unless the Cloud Function name is also "jsonLoad"
  

### Deploying from gcloud cli
~~~ 
gcloud beta functions deploy <name of the cloud function> --trigger-bucket=<trigger-bucket-name>  
--source=<path to gcsToBigQuery repository on your workstation> --stage-bucket=<gs://gcs-bucket> 
--entry-point=jsonLoad
~~~ 
