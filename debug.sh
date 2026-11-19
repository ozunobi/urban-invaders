#!/bin/bash
# Quick debug script for Expo Go issues

echo "🔍 Checking environment variables..."
if [ -f .env ]; then
  echo "✓ .env file found"
  grep "EXPO_PUBLIC_" .env | head -5
else
  echo "✗ .env file not found!"
fi

echo ""
echo "🔍 Checking node_modules..."
if [ -d node_modules ]; then
  echo "✓ node_modules exists"
  echo "  Number of packages: $(ls -1 node_modules | wc -l)"
else
  echo "✗ node_modules missing - running npm install"
fi

echo ""
echo "🔍 Checking font files..."
for font in src/app/assets/fonts/*.otf; do
  if [ -f "$font" ]; then
    echo "✓ $(basename $font)"
  fi
done

echo ""
echo "✅ Debug checks complete!"
echo ""
echo "To start the app:"
echo "  npm start -- --clear"
