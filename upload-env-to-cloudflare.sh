#!/bin/bash

# Script to upload environment variables from .env.production to Cloudflare Pages
# Usage: ./upload-env-to-cloudflare.sh <project-name>

set -e

PROJECT_NAME="${1:-jwt-debugger}"
ENV_FILE=".env.production"

if [ ! -f "$ENV_FILE" ]; then
  echo "Error: $ENV_FILE not found!"
  exit 1
fi

echo "🚀 Uploading environment variables to Cloudflare Pages project: $PROJECT_NAME"
echo ""

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
  echo "❌ wrangler CLI not found. Installing..."
  npm install -g wrangler
fi

# Login check
echo "Checking Cloudflare authentication..."
if ! wrangler whoami &> /dev/null; then
  echo "Please login to Cloudflare:"
  wrangler login
fi

echo ""
echo "📝 Reading variables from $ENV_FILE..."
echo ""

# Counter
count=0
failed=0

# Read and upload each variable
while IFS= read -r line || [ -n "$line" ]; do
  # Skip empty lines and comments
  [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]] && continue

  # Extract key and value
  if [[ "$line" =~ ^([^=]+)=(.*)$ ]]; then
    key="${BASH_REMATCH[1]}"
    value="${BASH_REMATCH[2]}"

    # Remove quotes if present
    value="${value#\"}"
    value="${value%\"}"

    echo "⬆️  Uploading: $key"

    # Upload to Cloudflare Pages
    if echo "$value" | wrangler pages secret put "$key" --project-name="$PROJECT_NAME" > /dev/null 2>&1; then
      echo "   ✅ Success"
      ((count++))
    else
      echo "   ❌ Failed"
      ((failed++))
    fi
    echo ""
  fi
done < "$ENV_FILE"

echo ""
echo "======================================"
echo "✨ Upload complete!"
echo "======================================"
echo "✅ Successfully uploaded: $count variables"
if [ $failed -gt 0 ]; then
  echo "❌ Failed: $failed variables"
fi
echo ""
echo "🌐 View your variables at:"
echo "https://dash.cloudflare.com/?to=/:account/pages/view/$PROJECT_NAME/settings/environment-variables"
echo ""
