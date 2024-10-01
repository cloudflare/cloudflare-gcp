#!/bin/sh

SCHEMA="schema-http.json"
# The name of the subdirectory in your bucket used for Cloudflare Logpush logs,
# for example, "logs/". If there is no subdirectory, use ""
DIRECTORY="logs/"
BUCKET_NAME="examplecom-logs"
DATASET="cloudflare_logstream"
TABLE="cloudflare_logs"
REGION="us-central1"
# You probably don't need to change these values:
FN_NAME="cf-logs-to-bigquery"
TOPIC_NAME="every_minute"
CRON_JOB_NAME="cf_logs_cron"

# Create pubsub topic
gcloud pubsub topics create $TOPIC_NAME
# Create cron job
gcloud scheduler jobs create pubsub $CRON_JOB_NAME --schedule="* * * * *" --topic=$TOPIC_NAME --message-body="60 seconds passed"
# Deploy function
gcloud functions deploy $FN_NAME \
  --runtime nodejs12 \
  --trigger-topic $TOPIC_NAME \
  --region=$REGION \
  --memory=1024MB \
  --entry-point=runLoadJob \
  --set-env-vars DATASET=$DATASET,TABLE=$TABLE,SCHEMA=$SCHEMA,BUCKET_NAME=$BUCKET_NAME,DIRECTORY=$DIRECTORY
