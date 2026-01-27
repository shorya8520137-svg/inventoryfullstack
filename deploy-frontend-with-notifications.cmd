@echo off
echo 🚀 DEPLOYING FRONTEND WITH NOTIFICATION FIXES
echo ================================================

echo.
echo 📋 Current Environment Variables:
echo NEXT_PUBLIC_API_BASE=%NEXT_PUBLIC_API_BASE%
type .env.local | findstr NEXT_PUBLIC_API_BASE

echo.
echo 🔧 Building Frontend...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Build failed!
    pause
    exit /b 1
)

echo.
echo ✅ Build successful!

echo.
echo 🚀 Deploying to Vercel...
call vercel --prod
if %errorlevel% neq 0 (
    echo ❌ Deployment failed!
    pause
    exit /b 1
)

echo.
echo 🎉 Deployment completed!
echo 💡 The frontend should now connect to: https://16.171.141.4.nip.io
echo 💡 Test the notification bell in the top navbar after deployment

echo.
echo 📝 Next steps:
echo 1. Wait for Vercel deployment to complete
echo 2. Open your frontend URL
echo 3. Login with admin@company.com / admin@123
echo 4. Check the notification bell in top navbar
echo 5. The bell should show notifications from backend

pause