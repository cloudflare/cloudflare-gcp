# GCS To Big Query Cloud Function
Google Cloud Function for processing `json` log files in Google Cloud Storage and creating BigQuery tables.

## Deploy from gcloud CLI
#### Open Google Cloud Shell
```bash
curl -LO "https://github.com/cloudflare/GCS-To-Big-Query/archive/master.zip" && unzip master.zip && cd GCS-To-Big-Query-master
```
#### Update the environment variables in deploy.sh (e.g. `nano deploy.sh`)
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
