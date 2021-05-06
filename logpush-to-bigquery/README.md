# Cloudflare Logpush ➜ Cloud Functions ➜ BigQuery

**Prequisites:**
- [Have an active Google Cloud account](https://cloud.google.com/free)
- [Enable Logpush on Cloudflare](https://developers.cloudflare.com/logs/logpush/logpush-dashboard/)

### Automatic Install
[![Open in Cloud Shell](https://gstatic.com/cloudssh/images/open-btn.svg)](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/cloudflare/cloudflare-gcp&tutorial=cloudshell.md&cloudshell_working_dir=logpush-to-bigquery&cloudshell_open_in_editor=deploy.sh)

### Manual Install

```bash
curl -LO "https://github.com/cloudflare/cloudflare-gcp/archive/master.zip" && unzip master.zip && cd cloudflare-gcp/logpush-to-biqquery
```

```bash
# Update the environment variables in deploy.sh
BUCKET_NAME="" # required – The name of Google Cloud Storage bucket used for Cloudflare Logpush logs.
SCHEMA="" # optional - The schema based on the logs' source. schema-http.json is the default. Spectrum users should change this to "schema-spectrum.json".
DATASET="" # optional – BigQuery dataset to write to. Will be created if necessary.
TABLE="" # optional – BigQuery table to write to. Will be created if necessary.
FN_NAME="" # optional - The name of your Cloud Function. The default is gcsbq.

# Deploy to GCP
sh ./deploy.sh
```
