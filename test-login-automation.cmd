@echo off
echo ========================================
echo 🤖 LOGIN PAGE AUTOMATION TEST
echo ========================================

echo.
echo 📋 This script will:
echo 1. Open browser with DevTools
echo 2. Navigate to login page
echo 3. Fill in credentials automatically
echo 4. Click login button
echo 5. Monitor console for errors
echo 6. Report what happens
echo.

echo 🔧 Installing puppeteer if needed...
npm install puppeteer

echo.
echo 🚀 Starting automated login test...
node test-login-automation.js

echo.
echo ✅ Test completed!
pause