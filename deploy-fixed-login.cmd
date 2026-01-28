@echo off
echo 🔧 Deploying Fixed Login Page
echo =============================

echo 📝 What was fixed:
echo - Applied working simple login approach to main login page
echo - Added console logging for debugging
echo - Simplified ClientLayout to prevent hydration issues
echo - Direct API calls without complex environment handling
echo.

echo 📦 Building frontend with fixed login...
call npm run build

if %errorlevel% neq 0 (
    echo ❌ Build failed!
    pause
    exit /b 1
)

echo 🚀 Deploying to Vercel...
call vercel --prod

if %errorlevel% neq 0 (
    echo ❌ Deployment failed!
    pause
    exit /b 1
)

echo ⏳ Waiting for deployment to propagate...
timeout /t 10 /nobreak

echo.
echo ✅ Fixed Login Page Deployed!
echo 🌐 Test URL: https://stockiqfullstacktest.vercel.app/login
echo.
echo 🧪 Test Procedure:
echo 1. Open the login page
echo 2. Open Developer Console (F12)
echo 3. Fill credentials: admin@company.com / Admin@123
echo 4. Click Sign In
echo 5. Check console for "🚀 Form submitted - JavaScript is working!"
echo 6. Should see successful login and redirect to products
echo.
echo 🎯 Expected: Login button should now work perfectly!
pause