@echo off
echo.
echo ============================================================
echo                   FIX FRONTEND LOGIN ISSUE
echo ============================================================
echo.
echo 🎯 PROBLEM: Sign In button not responding
echo ✅ API is working perfectly (confirmed)
echo ❓ Frontend needs to be rebuilt with correct environment
echo.
echo 🔧 SOLUTION: Rebuild and redeploy frontend
echo.
echo ============================================================
echo                   STEP 1: BUILD FRONTEND
echo ============================================================
echo.
echo Building with correct environment variables...
echo NEXT_PUBLIC_API_BASE=http://54.179.63.233.nip.io
echo.

npm run build

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ Build failed! Check the errors above.
    echo.
    pause
    exit /b 1
)

echo.
echo ✅ Build successful!
echo.
echo ============================================================
echo                   STEP 2: DEPLOY TO VERCEL
echo ============================================================
echo.
echo Deploying to production...
echo.

vercel --prod

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ Deployment failed! Check the errors above.
    echo.
    pause
    exit /b 1
)

echo.
echo ✅ Deployment successful!
echo.
echo ============================================================
echo                   STEP 3: TEST LOGIN
echo ============================================================
echo.
echo 🌐 Opening your frontend...
start https://stockiqfullstacktest.vercel.app/login
echo.
echo 📋 TEST INSTRUCTIONS:
echo 1. Wait for page to load completely
echo 2. Enter: admin@company.com
echo 3. Enter: Admin@123
echo 4. Click "Sign In" button
echo.
echo ✅ Login should work now!
echo.
echo If it still doesn't work:
echo 1. Press F12 to open Developer Tools
echo 2. Go to Console tab
echo 3. Try login again
echo 4. Look for any error messages
echo.
echo ============================================================
pause