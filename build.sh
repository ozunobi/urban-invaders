#!/bin/bash
set -e

echo "=== Building Expo Web App ==="
npm run build:web

echo "=== Verifying build output ==="
if [ ! -d "web-build" ]; then
  echo "ERROR: web-build directory not found!"
  exit 1
fi

if [ ! -f "web-build/embed/heatmap.html" ]; then
  echo "ERROR: web-build/embed/heatmap.html not found!"
  exit 1
fi

echo "=== Build verification successful ==="
ls -la web-build/embed/
