#!/bin/bash

echo "🎬 Intro Video Implementation - Quick Test"
echo "=========================================="
echo ""

echo "✓ Checking files..."
files=(
  "src/app/intro-video.tsx"
  "src/app/assets/videos/draft.mp4"
  "src/app/_layout.tsx"
  "src/app/signup.tsx"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "  ✓ $file"
  else
    echo "  ✗ $file (MISSING)"
  fi
done

echo ""
echo "✓ Checking intro-video.tsx implementation..."

if grep -q "useVideoPlayer" src/app/intro-video.tsx; then
  echo "  ✓ Uses expo-video VideoView"
else
  echo "  ✗ VideoView not found"
fi

if grep -q "watchedIntro" src/app/intro-video.tsx; then
  echo "  ✓ Stores watchedIntro flag"
else
  echo "  ✗ watchedIntro not found"
fi

if grep -q "\[IntroVideo\]" src/app/intro-video.tsx; then
  echo "  ✓ Has debugging console logs"
else
  echo "  ✗ No debug logs found"
fi

echo ""
echo "✓ Checking signup.tsx modification..."

if grep -q "router.replace('/intro-video')" src/app/signup.tsx; then
  echo "  ✓ Redirects to /intro-video"
else
  echo "  ✗ Redirect not found"
fi

echo ""
echo "✓ Checking _layout.tsx modification..."

if grep -q "intro-video" src/app/_layout.tsx; then
  echo "  ✓ Route added to stack"
else
  echo "  ✗ Route not found"
fi

echo ""
echo "=========================================="
echo "Ready to test! Run:"
echo "  npm run web     # Test on web (easiest)"
echo "  npm run ios     # Test on iOS"
echo "  npm run android # Test on Android"
echo ""
echo "Then:"
echo "  1. Create a new account"
echo "  2. Verify email"
echo "  3. Watch video appear"
echo "  4. Click 'Continue to App'"
echo "  5. Check console for [IntroVideo] logs"
echo "=========================================="
