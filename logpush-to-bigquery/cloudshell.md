# Cloudflare Log Push

## Set your project ID
```sh
gcloud config set project {{project-id}}
```

## Update the environment variables in deploy.sh
```sh
# required – The name of Google Cloud Storage bucket used for Cloudflare Logpush logs.
BUCKET_NAME=""

# optional – BigQuery dataset to write to. Will be created if necessary.
DATASET=""

# optional – BigQuery table to write to. Will be created if necessary.
TABLE=""

# optional - the name of your Cloud Function. default: gcsbq
FN_NAME=""
```

## Deploy to GCP
```sh
sh ./deploy.sh
```

## Done!
