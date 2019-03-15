#!/bin/sh

BUCKET_NAME="my_cloudflarelogs_gcp_storage_bucket"
DATASET="cloudflare_logs"
TABLE="cloudflare_logs"
FUNCTIONS="gcsbq"

for FUNC in $FUNCTIONS
do
    gcloud functions deploy $FUNC \
      --runtime nodejs8 \
      --trigger-resource $BUCKET_NAME \
      --trigger-event google.storage.object.finalize \
      --memory=1024MB \
      --set-env-vars DATASET=$DATASET,TABLE=$TABLE,SCHEMA="./schema.json"
done
