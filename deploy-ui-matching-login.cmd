@echo off
echo 🔧 Deploying UI-Matching Login Page
echo ===================================

echo 📝 What was updated:
echo - Matched exact UI design from your screenshot
echo - Clean, minimal white card design
echo - Proper logo with dark gray square icon
echo - Correct typography and spacing
echo - Light gray input backgrounds
echo - Blue button matching your design
echo - Removed dummy credentials section
echo - Professional, clean appearance
echo.

echo 🎯 Design Features:
echo - White card with subtle shadow
echo - Dark gray logo icon with white square
echo - Clean typography hierarchy
echo - Light gray input fields with focus states
echo - Blue Sign In button with hover effects
echo - Proper spacing and padding
echo - Responsive design
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
echo ✅ UI-MATCHING LOGIN DEPLOYED!
echo 🌐 Test URL: https://stockiqfullstacktest.vercel.app/login
echo.
echo 🧪 Expected Results:
echo - Clean white card design matching your UI
echo - Dark gray logo with white square icon
echo - Light gray input fields
echo - Blue Sign In button
echo - No dummy credentials shown
echo - Professional, minimal appearance
echo.
echo 🎯 Should look exactly like your UI design!
pause