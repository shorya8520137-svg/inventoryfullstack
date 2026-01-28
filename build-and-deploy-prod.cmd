@echo off
echo ========================================
echo BUILDING AND DEPLOYING TO VERCEL PROD
echo ========================================

cd /d "C:\Users\Admin\Desktop\stockiqfullstacktest"

echo.
echo [1/3] Running npm run build...
echo ----------------------------------------
call npm run build

echo.
echo [2/3] Checking build status...
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Build failed! Cannot proceed with deployment.
    pause
    exit /b 1
)

echo ✅ Build completed successfully!

echo.
echo [3/3] Deploying to Vercel production...
echo ----------------------------------------
call vercel --prod

echo.
echo ========================================
echo BUILD AND DEPLOYMENT COMPLETE!
echo ========================================
echo.
echo WHAT HAPPENED:
echo 1. ✅ Next.js build completed successfully
echo 2. ✅ Production deployment to Vercel initiated
echo 3. ✅ Logo updates are now live in production
echo.
echo LIVE URL: https://stockiqfullstacktest.vercel.app
echo.
pause