# Cloudflare Security Events

## Enter the Cloud Shell subdirectory for the project you want to use for the Cloudflare SCC integration
<walkthrough-project-setup></walkthrough-project-setup>

## Set Cloudshell to the project where you'd like to deploy the integration
```sh
gcloud config set project {{project-id}}
```

## Install dependencies and CLI:
Run:
```bash
sh install.sh
```

## Set Environment Variables and write deployment files
Run:
```bash
./setup setEnv
```

## Build configuration files:
Run:
```bash
./setup buildConf
```
**Tip:** If you need to edit `security-events/.env.yml` in the future, use this command to update the configuration files before redeploying.

## Enable the necessary Cloud APIs to run the Cloudflare integration
```bash
./setup enableAPIs
```

## Create Cloud Scheduler event (deployed via Pub/Sub)
```bash
./setup setSchedule
```

## Create a service account key for SCC
Run:
```bash
./setup getServiceAcctKey
```

**Tip:** This may throw some errors but if the final message succeeds, you're probably ok. Having issues? Make sure you're using the correct account:
```bash
gcloud config set account MY_GCP_ACCT_EMAIL
```

## Deploy integration
```bash
./setup deploy
```


## Done!
The configuration file, `.env.yml` can be modified here:
```sh
cd cloudflare-gcp/security-events
nano .env.yml
```
  
Then, to rebuild the necessary configuration files:
```sh
cd cloudflare-gcp/cli
./setup buildConf
```

<walkthrough-directive-name param-name="conclusion-trophy">
</walkthrough-directive-name>
