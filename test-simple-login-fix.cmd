@echo off
echo 🔧 Testing Simple Login Page Fix
echo ================================

echo 📦 Building frontend with simple login page...
call npm run build

echo 🚀 Deploying to Vercel...
call vercel --prod

echo ⏳ Waiting for deployment...
timeout /t 10 /nobreak

echo 🧪 Running automation test on simple login page...
node test-simple-login-automation.js

echo ✅ Test completed!
pause