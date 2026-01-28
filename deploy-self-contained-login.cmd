@echo off
echo 🔧 Deploying SELF-CONTAINED Login Page
echo =======================================

echo 📝 What was fixed:
echo - Removed conflicting layout.jsx that caused React errors #418 and #423
echo - Converted to inline styles (no CSS modules dependencies)
echo - EXACT same JavaScript logic as working simple-login
echo - Beautiful styling with inline CSS
echo - No external dependencies or imports
echo.

echo 🎯 This should work because:
echo - No layout conflicts (removed login/layout.jsx)
echo - No CSS module imports (all inline styles)
echo - Same working JavaScript as simple-login
echo - Goes through main layout but bypasses ClientLayout for login
echo.

echo 📦 Building frontend...
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

echo ⏳ Waiting for deployment...
timeout /t 10 /nobreak

echo.
echo ✅ SELF-CONTAINED LOGIN DEPLOYED!
echo 🌐 Test URL: https://stockiqfullstacktest.vercel.app/login
echo.
echo 🧪 Expected Results:
echo - No React errors #418 or #423
echo - Beautiful login page with gradient background
echo - Console shows: "🚀 Form submitted - JavaScript is working!"
echo - Successful login and redirect to products
echo.
echo 🎯 This eliminates all possible conflicts!
pause