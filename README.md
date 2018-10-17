# GCS To Big Query Cloud Function
Google Cloud Function for processing `json` log files in Google Cloud Storage and creating BigQuery tables!

## Deploying from gcloud cli

```bash
curl -LO "https://github.com/cloudflare/GCS-To-Big-Query/archive/master.zip" && unzip master.zip && cd GCS-To-Big-Query-master && sh ./start.sh
```
  
## Advanced Configuration
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


<!-- 
[![Open in Cloud Shell](http://gstatic.com/cloudssh/images/open-btn.svg)]
// (https://console.cloud.google.com/cloudshell/open?git_repo=https%3A%2F%2Fgithub.com%2Fcloudflare%2FGCS-To-Big-Query%2F&page=shell) 
--!>
