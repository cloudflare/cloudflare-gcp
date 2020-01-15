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

## Options
This integration establishes pipelines between five different Cloudflare API endpoints and Security Center, using the Cloudflare RayID to unify data points into a single SCC finding.


### Edit `config.yaml`
```yaml
# Monitor these zones for security events
application_hosts:
  - example.com
  - another-example.com
  - another-website-example.com

# Mode can alternatively be set to "logshare" to pull from Cloudflare's
# Enterprise logshare service instead of Cloudflare's Analytic's APIs
# Note that selecting logshare is not recommended for customers with high
# traffic volume; Security Center rate limit findings resulting in data loss 
mode: standard

# Frequency at which to poll the Cloudflare API endpoints. Uses cron syntax
frequency: '* * * * *' # default

# Retrieve 100% of logs from your Cloudflare Access applicatons
access: 1.00 # default

# Retrieve 50% of the logs from Firewall Events API endpoint
firewall_events: 0.50 # default

# Retreive 2% logs for requests to Spectrum applications at L4
# spectrum: 0.02 (not available in v1)
```

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

### Coming Soon
```bash
# Run a search against BigQuery for a time period, to enrich logs:
# Retrieve all request logs from  the last 12 hours
cfscc enrich period=12h

```