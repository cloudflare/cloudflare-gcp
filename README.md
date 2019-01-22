# GCS To Big Query Cloud Function
Google Cloud Function for processing `json` log files in Google Cloud Storage and creating BigQuery tables.

## Deploy from gcloud CLI
[![Open Cloud Shell](http://gstatic.com/cloudssh/images/open-btn.svg)](https://console.cloud.google.com/cloudshell/editor?shellonly=true)
```bash
curl -LO "https://github.com/cloudflare/GCS-To-Big-Query/archive/master.zip" && unzip master.zip && cd GCS-To-Big-Query-master
```
#### Open deploy.sh and update the environment variables
```bash

BUCKET_NAME="" # required – The name of Google Cloud Storage bucket used for Cloudflare Logpush logs.
DATASET="" # optional – BigQuery dataset to write to. Will be created if necessary.
TABLE="" # optional – BigQuery table to write to. Will be created if necessary.
```
#### Deploy function
```bash
sh ./deploy.sh
```

  
*Note: You can also deploy this function locally using the same steps below. The only requirement is the [gcloud SDK](https://cloud.google.com/sdk/downloads).*
