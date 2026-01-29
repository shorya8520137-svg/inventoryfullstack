@echo off
echo ========================================
echo DEPLOYING CLEAN PROFESSIONAL UI
echo ========================================

echo Step 1: Building clean professional design...
npm run build

if %ERRORLEVEL% neq 0 (
    echo ❌ Build failed! Please check for errors.
    pause
    exit /b 1
)

echo Step 2: Deploying to Vercel production...
vercel --prod

if %ERRORLEVEL% neq 0 (
    echo ❌ Deployment failed! Please check Vercel configuration.
    pause
    exit /b 1
)

echo ========================================
echo ✅ CLEAN PROFESSIONAL UI DEPLOYED!
echo ========================================
echo.
echo 🎨 Clean Design Features:
echo   • Removed "Dispatch Orders" heading
echo   • Integrated search, date, actions in table header
echo   • Minimal black and grey professional theme
echo   • Smaller, cleaner delete boxes
echo   • Streamlined interface design
echo.
echo 🔗 Live URL: https://stockiqfullstacktest.vercel.app
echo 📊 Orders Page: https://stockiqfullstacktest.vercel.app/order
echo.
pause