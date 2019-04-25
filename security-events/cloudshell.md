# Cloudflare Security Events

## Set Cloudshell to the project *you currently use* to store Cloudflare logs
```
gcloud config set project {{project-id}}
```
* Note: if you don't have Logpush setup to stream logs in Google Cloud Storage, reach out to your customer success manager or go here if you know what you're doing: https://dash.cloudflare.com?analytics

## Install:
```bash
npm install
```

## Set Environment Variables and rewrite deployment files
```bash
npm run setEnv
```
**Tip**: Stuck? Try setting your IAM role `gcloud config set account MY_GCP_ACCT_EMAIL`

## Enable the necessary Cloud APIs to run the Cloudflare integration
```bash
npm run enableAPIs
```
**Tip**: Stuck? Try resetting your IAM role `gcloud config set account MY_GCP_ACCT_EMAIL`

## Get service account key. Service Account will be created for you if necessary
```bash
npm run getServiceAcctKey
```

## Deploy integration
```
npm run deploy
```

**Tip**: Stuck? You can:
* Change IAM role `gcloud config set account MY_GCP_ACCT_EMAIL`
* Modify env variables `vim deployment/.env.yml`
* View function deployments `vim dist/functions.yml`

## Done!
<walkthrough-directive-name param-name="conclusion-trophy">
</walkthrough-directive-name>

View Stackdriver logs:
https://console.cloud.google.com/logs/viewer?project={{project-id}}&resource=cloud_function
