# SCC Documentation v2

## Setup

1. Go to [https://dash.cloudflare.com/profile/api-tokens](https://dash.cloudflare.com/profile/api-tokens)
2. Click **Create Token** and check **Start with a Template**. Select the **Read all resources** option:

![](https://storage.franktaylor.io/file/ab0cb4f9ab9a758dee1d6f/HzmyTww5VYoW.gif)

3. Once the template is visible, you can remove permissions for the zones/accounts you don't want to use with Google Security Center
4. Copy the token to your clipboard or keep the browser tab open
5. Enter Google Cloud Shell:

[![Open in Cloud Shell](http://gstatic.com/cloudssh/images/open-btn.svg)](https://console.cloud.google.com/cloudshell/editor?cloudshell_git_repo=https%3A%2F%2Fgithub.com%2Fcloudflare%2Fcloudflare-gcp&cloudshell_print=security-events%2Fcloudshell.md&cloudshell_working_dir=cli)

## Existing Limitations
This integration will only fetch the most recent 1000 Firewall Events. You can set the scheduler - which defaults to 60 minutes - to run more frequently if you need to retrieve more data. 

## CLI commands
### Before starting any session, make sure to run the following commands:
```bash
gcloud config set account MY_GCP_ACCT_EMAIL
cd ~/cloudflare-gcp/cli
```


### Set Environment Variables and rewrite deployment files
```bash
npm run setEnv
```

### Enable the necessary Cloud APIs to run the Cloudflare integration
```bash
npm run enableAPIs
```

### Setup and deploy the Cloud Scheduler
```bash
# To Do - make this actually configurable. Only runs every hour right now
npm run setSchedule
```

### Create a service account key for SCC
```bash
# Ensure your Google Application Credentials are set correctly by running:
gcloud config set account MY_GCP_ACCT_EMAIL

# .. then retrieve the service account key
npm run getServiceAcctKey
```

### Deploy or redeploy integration
```bash
npm run deploy
```
