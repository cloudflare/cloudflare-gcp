# Cloudflare Log Push ➜ Cloud Functions ➜ BigQuery

**Prequisites:**
- [Active Google Cloud account](https://cloud.google.com/free)
- [Log Push enabled on Cloudflare](https://developers.cloudflare.com/logs/logpush/logpush-dashboard/)

### Automatic Install
[![Open in Cloud Shell](https://gstatic.com/cloudssh/images/open-btn.svg)](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/cloudflare/cloudflare-gcp&tutorial=cloudshell.md&cloudshell_working_dir=logpush-to-bigquery&cloudshell_open_in_editor=deploy.sh)

### Manual Install

```bash
curl -LO "https://github.com/cloudflare/cloudflare-gcp/archive/master.zip" && unzip master.zip && cd cloudflare-gcp/logpush-to-biqquery
```

```bash
# Update the environment variables in deploy.sh
BUCKET_NAME="" # required – The name of Google Cloud Storage bucket used for Cloudflare Logpush logs.
SCHEMA="" # optional - The schema based on the logs' source. schema-http.json is the default. Spectrum users will want to change this to "schema-spectrum.json"
DATASET="" # optional – BigQuery dataset to write to. Will be created if necessary.
TABLE="" # optional – BigQuery table to write to. Will be created if necessary.
FN_NAME="" # optional - the name of your Cloud Function | default: gcsbq
EXPIRATION_MS="" # optional - records should be expired after this amount of time
TIME_PARTITIONING_FIELD="" # optional - the name of the field used for time partitioning. defaults to "EdgeStartTimestamp". spectrum users will want to change this to "Timestamp".

# Deploy to GCP
sh ./deploy.sh
```
