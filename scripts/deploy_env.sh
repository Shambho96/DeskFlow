#!/bin/bash
set -e

# Usage: ./scripts/deploy_env.sh <BUCKET_NAME> <CLOUDFRONT_DISTRIBUTION_ID>
BUCKET_NAME="$1"
DISTRIBUTION_ID="$2"
LOCAL_FOLDER="./dist"

if [ -z "$BUCKET_NAME" ] || [ -z "$DISTRIBUTION_ID" ]; then
  echo "Usage: $0 <S3_BUCKET_NAME> <CLOUDFRONT_DISTRIBUTION_ID>"
  exit 1
fi

if [ ! -d "$LOCAL_FOLDER" ] || [ -z "$(ls -A "$LOCAL_FOLDER")" ]; then
  echo "Error: Local build folder ($LOCAL_FOLDER) is empty or does not exist."
  echo "Run 'npm run build' first."
  exit 1
fi

echo "--- 1. Uploading static assets with 1-year cache ---"
aws s3 sync "$LOCAL_FOLDER" "s3://$BUCKET_NAME" \
  --delete \
  --size-only \
  --exclude "index.html" \
  --cache-control "public, max-age=31536000, immutable"

echo "--- 2. Uploading index.html with no-cache ---"
aws s3 cp "$LOCAL_FOLDER/index.html" "s3://$BUCKET_NAME/index.html" \
  --cache-control "no-cache, no-store, must-revalidate"

echo "--- 3. Creating CloudFront Invalidation ---"
INVALIDATION_ID=$(aws cloudfront create-invalidation \
  --distribution-id "$DISTRIBUTION_ID" \
  --paths "/*" \
  --query 'Invalidation.Id' \
  --output text)

echo "Invalidation started with ID: $INVALIDATION_ID"
aws cloudfront wait invalidation-completed \
  --distribution-id "$DISTRIBUTION_ID" \
  --id "$INVALIDATION_ID"

echo "Deployment complete & cache invalidated successfully!"
