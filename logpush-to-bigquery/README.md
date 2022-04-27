# Cloudflare Log Push ➜ Cloud Functions ➜ BigQuery

**Prequisites:**

- [Active Google Cloud account](https://cloud.google.com/free)
- [Log Push enabled on Cloudflare](https://developers.cloudflare.com/logs/logpush/logpush-dashboard/)

### Automatic Install

[![Open in Cloud Shell](https://gstatic.com/cloudssh/images/open-btn.svg)](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/cloudflare/cloudflare-gcp&tutorial=cloudshell.md&cloudshell_working_dir=logpush-to-bigquery&cloudshell_open_in_editor=deploy.sh)

### Manual Install

```bash
BRANCH="logstream-update"
curl -LO "https://github.com/cloudflare/cloudflare-gcp/archive/refs/heads/$BRANCH.zip" && unzip "$BRANCH".zip && cd cloudflare-gcp-"$BRANCH"/logpush-to-biqquery
```

```bash
# Update the environment variables in deploy.sh
BUCKET_NAME="" # required – The name of Google Cloud Storage bucket used for Cloudflare Logpush logs.
DIRECTORY="/" # required – The name of the subdirectory in your bucket used for Cloudflare Logpush logs, # for example, "logs/".
SCHEMA="" # optional - The schema based on the logs' source. schema-http.json is the default. Spectrum users will want to change this to "schema-spectrum.json"
DATASET="" # optional – BigQuery dataset to write to. Will be created if necessary.
TABLE="" # optional – BigQuery table to write to. Will be created if necessary.
FN_NAME="" # optional - the name of your Cloud Function | default: gcsbq
# optional - the name of the pubsub topic that will be published every minute
TOPIC_NAME=""
CRON_JOB_NAME="" # optional - name of the cron job that is being created.
# Deploy to GCP
sh ./deploy.sh
```
