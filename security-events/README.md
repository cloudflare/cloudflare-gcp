# SCC Documentation v0.2

## Setup

1. Go to [https://dash.cloudflare.com/profile/api-tokens](https://dash.cloudflare.com/profile/api-tokens)
2. Click **Create Token** and check **Start with a Template**. Select the **Read all resources** option:

![](https://storage.franktaylor.io/file/ab0cb4f9ab9a758dee1d6f/HzmyTww5VYoW.gif)

3. Once the template is visible, you can remove permissions for the zones/accounts you don't want to use with Google Security Center
4. Copy the token to your clipboard or keep the browser tab open
5. Enter Google Cloud Shell:

[![Open in Cloud Shell](http://gstatic.com/cloudssh/images/open-btn.svg)](https://console.cloud.google.com/cloudshell/editor?cloudshell_git_branch=staging&cloudshell_git_repo=https%3A%2F%2Fgithub.com%2Fcloudflare%2Fcloudflare-gcp&cloudshell_print=security-events%2Fcloudshell.md&cloudshell_working_dir=cli)


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
