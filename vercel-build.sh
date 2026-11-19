#!/bin/bash
echo "Building Expo web app..."
npm run build:web

echo "Verifying web-build directory..."
ls -la web-build/

echo "Build complete!"
