@echo off
echo 🔧 Testing All Login Approaches
echo ===============================

echo 📦 Building frontend with all login fixes...
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
timeout /t 15 /nobreak

echo.
echo 🧪 Testing Login Approaches:
echo 1. Original login page: /login
echo 2. Simple login page: /simple-login  
echo 3. Isolated login page: /login-isolated
echo.

echo 📱 You can now test these URLs:
echo https://stockiqfullstacktest.vercel.app/login
echo https://stockiqfullstacktest.vercel.app/simple-login
echo https://stockiqfullstacktest.vercel.app/login-isolated
echo.

echo 🔍 Running automation test on simple login...
node test-simple-login-automation.js

echo.
echo ✅ All login approaches deployed!
echo 📋 Test each one manually to see which works
echo 🎯 Expected: JavaScript should work and login should succeed
pause