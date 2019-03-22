# Cloudflare | GCP
[![Latest Github release](https://img.shields.io/github/package-json/v/cloudflare/cloudflare-gcp.svg)](https://github.com/cloudflare/cloudflare-gcp/releases/latest)
=====
Integrate Cloudflare Enterprise Log Push with BigQuery, Dataflow and Security Command Center on Google Cloud.

### Contents
[Cloudflare Log Push ➜ Cloud Functions ➜ BigQuery](#one)

----
<div id="one"></div>

### Cloudflare Log Push ➜ Cloud Functions ➜ BigQuery
**Prequisites:**
* [Active Google Cloud account](https://cloud.google.com/free)
* [Log Push enabled on Cloudflare](https://developers.cloudflare.com/logs/logpush/logpush-dashboard/)



**Automatic Install**
[![Open in Cloud Shell](https://gstatic.com/cloudssh/images/open-btn.svg)](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/cloudflare/cloudflare-gcp&tutorial=logpush-to-bigquery/cloudshell.md&cloudshell_working_dir=logpush-to-bigquery&cloudshell_open_in_editor=deploy.sh)


**Manual Install**
```bash
curl -LO "https://github.com/cloudflare/cloudflare-gcp/archive/master.zip" && unzip master.zip && cd cloudflare-gcp/logpush-to-biqquery
```

```bash
# Update the environment variables in deploy.sh
BUCKET_NAME="" # required – The name of Google Cloud Storage bucket used for Cloudflare Logpush logs.
DATASET="" # optional – BigQuery dataset to write to. Will be created if necessary.
TABLE="" # optional – BigQuery table to write to. Will be created if necessary.
FN_NAME="" # optional - the name of your Cloud Function | default: gcsbq

# Deploy to GCP
sh ./deploy.sh
```
----
### Cloudflare Log Push ➜ Dataflow ➜ Security Command Center
#### Prequisites
* *Current in private beta. Check back soon for updates!*

