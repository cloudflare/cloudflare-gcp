# GCS To Big Query Cloud Function
Google Cloud Function for processing `json` log files in Google Cloud Storage and creating BigQuery tables!

## Deploying from gcloud cli
```bash
# 1) Install

curl -LO "https://github.com/cloudflare/GCS-To-Big-Query/archive/master.zip" && unzip master.zip && cd GCS-To-Big-Query-master
```
```bash
# 2) Open `deploy.sh` and update the environment variables

BUCKET_NAME="" # required – The name of Google Cloud Storage bucket used for Cloudflare Logpush logs.
DATASET="" # optional – BigQuery dataset to write to. Will be created if necessary.
TABLE="" # optional – BigQuery table to write to. Will be created if necessary.
```
```bash
# 3) Deploy function

sh ./deploy.sh
```

* If you're working with this package locally, then the [gcloud SDK](https://cloud.google.com/sdk/downloads) needs to be installed.

<!--
[![Open in Cloud Shell](http://gstatic.com/cloudssh/images/open-btn.svg)]
// (https://console.cloud.google.com/cloudshell/open?git_repo=https%3A%2F%2Fgithub.com%2Fcloudflare%2FGCS-To-Big-Query%2F&page=shell)
--!>
