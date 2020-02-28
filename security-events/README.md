🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨

Cloudflare GCP Security Events has been deprecated. No more contributions will be accepted. The master branch will be replaced by examples for integrating Cloudflare logs with Security Command Center

🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨
# SCC Documentation - Beta v0.2

## Prerequisites
Before starting, please ensure that [Cloudflare Log retention is enabled](https://api.cloudflare.com/#logs-received-get-log-retention-flag). Note that this setting is different from Logpush and is off by default. Log retention can only be enabled by an admin in your Cloudflare account. If you need to enable log retention, we recommend this shell script: https://gist.github.com/shagamemnon/f3aecce00e192cfd9282dc7dc2bd1ee8

## How it works
![diagram.jpg](https://storage.franktaylor.io/scc_diagram.jpg)

## Setup
1. Go to [https://dash.cloudflare.com/profile/api-tokens](https://dash.cloudflare.com/profile/api-tokens)
2. Click **Create Token** and check **Start with a Template**. Select the **Read all resources** option:

![](https://storage.franktaylor.io/d06cef5527f329e519553f649b3a76e219f2c9d6/CleanShot%202020-01-22%20at%2003.27.31.png)

3. Once the template is visible, you can remove permissions for the zones/accounts you don't want to use with Google Security Command Center
4. Copy the token to your clipboard or keep the browser tab open
5. [Enable Cloudflare as a security source](https://console.cloud.google.com/security/command-center/source-registration;partnerId=cloudflare;solutionId=cloudflare-security-events) in Google Cloud Security Command Center. Leave this browser tab open as well

## Install
[![Open in Cloud Shell](https://gstatic.com/cloudssh/images/open-btn.svg)](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/cloudflare/cloudflare-gcp&tutorial=cloudshell-security-events.md&cloudshell_working_dir=cli&cloudshell_print=install.sh)


## Updating your configuration

  
```sh
# The configuration file, `.env.yml` is generated during the Cloud Shell session. Once created, you can find it here:
cat ~/cloudflare-gcp/security-events/.env.yml

# If you change `.env.yml` you need to rebuild the configuration files before deploying
cd ~/cloudflare-gcp/cli
./setup buildConf

# Retrieve new service account key based on env variable in .env.yml
cd ~/cloudflare-gcp/cli
./setup getServiceAcctKey

# Configure and update cron schedule
nano ~/cloudflare-gcp/cli/confs/setSchedule.yml
./setup setSchedule

# Deploy new configuration
cd ~/cloudflare-gcp/cli
./setup deploy
```
