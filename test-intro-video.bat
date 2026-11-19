@echo off
REM Intro Video Implementation - Quick Test
echo.
echo 🎬 Intro Video Implementation - Quick Test
echo ==========================================
echo.

echo Checking files...
setlocal enabledelayedexpansion
set files=src\app\intro-video.tsx src\app\assets\videos\draft.mp4 src\app\_layout.tsx src\app\signup.tsx

for %%f in (%files%) do (
  if exist "%%f" (
    echo   ✓ %%f
  ) else (
    echo   ✗ %%f [MISSING]
  )
)

echo.
echo Checking intro-video.tsx implementation...

findstr /M "useVideoPlayer" src\app\intro-video.tsx >nul
if %errorlevel%==0 (
  echo   ✓ Uses expo-video VideoView
) else (
  echo   ✗ VideoView not found
)

findstr /M "watchedIntro" src\app\intro-video.tsx >nul
if %errorlevel%==0 (
  echo   ✓ Stores watchedIntro flag
) else (
  echo   ✗ watchedIntro not found
)

findstr /M "[IntroVideo]" src\app\intro-video.tsx >nul
if %errorlevel%==0 (
  echo   ✓ Has debugging console logs
) else (
  echo   ✗ No debug logs found
)

echo.
echo Checking signup.tsx modification...

findstr /M "router.replace('/intro-video')" src\app\signup.tsx >nul
if %errorlevel%==0 (
  echo   ✓ Redirects to /intro-video
) else (
  echo   ✗ Redirect not found
)

echo.
echo Checking _layout.tsx modification...

findstr /M "intro-video" src\app\_layout.tsx >nul
if %errorlevel%==0 (
  echo   ✓ Route added to stack
) else (
  echo   ✗ Route not found
)

echo.
echo ==========================================
echo ✓ Ready to test! Run:
echo   npm run web     [Test on web - easiest]
echo   npm run ios     [Test on iOS]
echo   npm run android [Test on Android]
echo.
echo Then follow these steps:
echo   1. Create a new account
echo   2. Verify email
echo   3. Watch video appear
echo   4. Click 'Continue to App'
echo   5. Check console for [IntroVideo] logs
echo.
echo 📋 Debugging guide: See INTRO_VIDEO_DEBUGGING.md
echo ==========================================
pause
