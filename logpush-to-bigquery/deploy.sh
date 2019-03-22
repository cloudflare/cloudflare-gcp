#!/bin/sh

BUCKET_NAME="camiliame-logs"
DATASET="cloudflare_logs"
TABLE="cloudflare_logs"
FN_NAME='gcsbq_2'
REGION='us-central1'
# FUNC=${1:-$FN_NAME}


gcloud functions deploy $FN_NAME \
  --runtime nodejs8 \
  --trigger-resource $BUCKET_NAME \
  --trigger-event google.storage.object.finalize \
  --region=$REGION \
  --memory=1024MB \
  --entry-point=gcsbq \
  --set-env-vars DATASET=$DATASET,TABLE=$TABLE,SCHEMA="./schema.json"
