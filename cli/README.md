# Cloudflare Security Events
> Extend your security view from the edge.

## Automatic Installation
### Quickstart

[![Open in Cloud Shell](https://gstatic.com/cloudssh/images/open-btn.svg)](https://console.cloud.google.com/cloudshell/open?git_repo=https://bitbucket.org/cloudflaregcp/cloudflare-security-events.git&tutorial=cloudshell.md)

## IAM Permissions
Google Cloud Security Command Center makes use of organization and project-level IAM permissions. As such, the person who deploys this integration will need to have the Organization Admin role.

#### `.env.yml`
If you run into errors, the cause is most like your permissions scope. Fix these by modifying `.env.yml`:
```sh
cd cloudflare-security-events/deployment
vim .env.yml
```
Unless otherwise specified during onboarding, `.env.yml` looks inside the project (PROJECT_ID) for the BigQuery table and Cloud Storage bucket:
```yml
// default settings – cloudflare_logs.camiliame_logs must be under active-incline-183216 for this to work
PROJECT_ID: active-incline-183216
GCLOUD_ORG: '1065635207347'
CREDENTIALS: ./scc_key.json
BUCKET_NAME: cloudflare-logs-bucket
BQ_DATASET: cloudflare_dataset.events_table
SERVICE_ACCOUNT: gcp-gcp-admin
BASE_DIR: /usr/local/scc-serverless
DEPLOYMENT_DIR: /usr/local/scc-serverless/deployment
```

You can reassign environment variables to be project-specific like this:
```js
BQ_DATASET: some-project-200019.cloudflare_logs.some_table
```

## Manual Installation & API
> Note: if you don't have Logpush setup to stream logs in Google Cloud Storage, reach out to your customer success manager or go here if you know what you're doing: https://dash.cloudflare.com?analytics

#### Open Google Cloud Shell and clone this repository, then set Cloudshell to the project you use to store Cloudflare logs
```
gcloud config set project MY_PROJECT
```

#### Enter project directory and install dependencies:
```
cd cloudflare-security-events
npm install
```

#### Enable the necessary Cloud APIs to run the Cloudflare integration
```
cfse enableAPIs
```

#### Set Environment Variables and rewrite deployment files
```
cfse setEnv
```

#### Get service account key. Service Account will be created for you if necessary
```
cfse getServiceAcctKey
```

#### Deploy integration
```
cfse deploy
```

#### Test Configuration
```
cfse scc post
```
