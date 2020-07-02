# Cloudflare Log Push

## Select project
<walkthrough-project-setup></walkthrough-project-setup>

## Set project ID
```
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

# optional - specify a different schema. Spectrum users will want to change this to
# schema-spectrum.json.
SCHEMA="schema-http.json"

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
