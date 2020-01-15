# Cloudflare Security Events

## Enter the Cloud Shell subdirectory for the project you want to use for the Cloudflare SCC integration
<walkthrough-project-setup></walkthrough-project-setup>

## Set Cloudshell to the project *you currently use* to store Cloudflare logs
```sh
gcloud config set project {{project-id}}
```

## Enter CLI and install dependencies:
Run:
```bash
cd cli
npm install 
```

## Set Environment Variables and write deployment files
Run:
```bash
npm run setEnv
```

## Enable the necessary Cloud APIs to run the Cloudflare integration
```bash
npm run enableAPIs
```

## Setup and deploy the Cloud Scheduler
Run:
```bash
npm run setSchedule
```
*To Do - make this actually configurable. Only runs every hour right now*

## Create a service account key for SCC
Run:
```bash
npm run getServiceAcctKey
```

**Tip:** Having issues? Make sure you're using the correct account:
```bash
gcloud config set account MY_GCP_ACCT_EMAIL
```

## Deploy integration
```bash
npm run deploy
```


## Done!
<walkthrough-directive-name param-name="conclusion-trophy">
</walkthrough-directive-name>
