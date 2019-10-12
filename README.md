# Cloudflare | GCP
<!-- [![Latest Github release](https://img.shields.io/github/package-json/v/cloudflare/cloudflare-gcp.svg)](https://github.com/cloudflare/cloudflare-gcp/releases/latest) -->

Integrate Cloudflare Enterprise Logpush with Google BigQuery and Security Command Center on Google Cloud.

----
<div id="one"></div>

### Cloudflare Logpush ➜ Google BigQuery
**Prequisites:**
* [Active Google Cloud account](https://cloud.google.com/free)
* [Logpush enabled on Cloudflare](https://developers.cloudflare.com/logs/logpush/logpush-dashboard/)

#### Automatic Install

[![Open in Cloud Shell](https://gstatic.com/cloudssh/images/open-btn.svg)](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/cloudflare/cloudflare-gcp&tutorial=cloudshell.md&cloudshell_working_dir=logpush-to-bigquery&cloudshell_open_in_editor=deploy.sh)


#### Manual Install
```bash
# Download and unzip the package
curl -LO "https://github.com/cloudflare/cloudflare-gcp/archive/master.zip" && unzip master.zip && cd cloudflare-gcp/logpush-to-bigquery
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
<div id="two"></div>

### Cloudflare Log Push ➜ Dataflow ➜ Security Command Center
#### Prequisites
* *Current in beta*

[![Open in Cloud Shell](https://gstatic.com/cloudssh/images/open-btn.svg)](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/cloudflare/cloudflare-gcp&tutorial=../security-events/cloudshell.md&cloudshell_working_dir=cli)
