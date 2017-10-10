# gcsToBigQuery
Google Cloud Function Code to push json files from GCS to Big Query

### Deploying from gcloud cli
~~~ 
gcloud beta functions deploy <name of the cloud function> --trigger-bucket=<trigger-bucket-name>  
--source=<path to gcsToBigQuery repository on your workstation> --stage-bucket=<gs://gcs-bucket> 
--entry-point=jsonLoad
~~~ 
