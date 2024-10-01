# Cloudflare Log Push

## Select project

<walkthrough-project-setup></walkthrough-project-setup>

## Set project ID

```sh
gcloud config set project {{project-id}}
```

## Update the environment variables in deploy.sh

```sh
sudo nano deploy.sh
```

#### Variable reference

```
# required – The name of Google Cloud Storage bucket used for Cloudflare Logpush logs.
BUCKET_NAME=""

# required – The name of the subdirectory in your bucket used for Cloudflare Logpush logs,
# for example, "logs/". If there is no subdirectory, use "/"
DIRECTORY="/"

# optional - specify a different schema. Spectrum users will want to change this to
# schema-spectrum.json.
SCHEMA="schema-http.json"

# optional – BigQuery dataset to write to. Will be created if necessary.
DATASET=""

# optional – BigQuery table to write to. Will be created if necessary.
TABLE=""

# optional - the name of your Cloud Function. default: gcsbq
FN_NAME=""

# optional - the name of the pubsub topic that will be published every minute
TOPIC_NAME="every_minute"

# optional - name of the cron job that is being created.
CRON_JOB_NAME="" 


```

## Deploy to GCP

```sh
sh ./deploy.sh
```

## Done!
