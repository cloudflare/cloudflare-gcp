#!/bin/sh

SCHEMA="schema-http.json"
BUCKET_NAME="examplecom-logs"
DATASET="cloudflare_logstream"
TABLE="cloudflare_logs"
REGION="us-central1"
# You probably don't need to change these values:
FILE_FN_NAME="cf-logs-files"
FILE_TOPIC_NAME="cf_logs_files"
FILE_SUBSCRIPTION_NAME="cf_logs_files-sub"
SCHEDULE_FN_NAME="cf-logs-to-bigquery"
SCHEDULE_TOPIC_NAME="every_minute"

# Create pubsub topic
gcloud pubsub topics create $SCHEDULE_TOPIC_NAME
gcloud pubsub topics create $FILE_TOPIC_NAME
gcloud pubsub subscriptions create $FILE_SUBSCRIPTION_NAME \
  --topic=$FILE_TOPIC_NAME \
  --expiration-period=never
# Create cron job
gcloud scheduler jobs create pubsub cf_logs_cron --schedule="* * * * *" --topic=$SCHEDULE_TOPIC_NAME --message-body="60 seconds passed"
# Deploy functions
ENVVARS="DATASET=$DATASET,TABLE=$TABLE,SCHEMA=$SCHEMA,BUCKET_NAME=$BUCKET_NAME,FILE_TOPIC_NAME=$FILE_TOPIC_NAME,FILE_SUBSCRIPTION_NAME=$FILE_SUBSCRIPTION_NAME"
gcloud functions deploy $FILE_FN_NAME \
  --runtime nodejs10 \
  --trigger-resource $BUCKET_NAME \
  --trigger-event google.storage.object.finalize \
  --region=$REGION \
  --memory=1024MB \
  --entry-point=runNewFiles \
  --set-env-vars ${ENVVARS}
gcloud functions deploy $SCHEDULE_FN_NAME \
  --runtime nodejs10 \
  --trigger-topic $SCHEDULE_TOPIC_NAME \
  --region=$REGION \
  --memory=1024MB \
  --entry-point=runLoadJob \
  --set-env-vars ${ENVVARS}
