#!/bin/bash
set -e
echo "Building application..."
NODE_OPTIONS="--max-old-space-size=4096" npm run build
echo "Build complete. Starting production server..."
NODE_ENV=production node dist/index.js
