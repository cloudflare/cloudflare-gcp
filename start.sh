gcloud functions deploy jsonLoad --runtime nodejs8 --trigger-resource "$BUCKET_NAME" --trigger-event google.storage.object.finalize
