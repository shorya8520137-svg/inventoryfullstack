@echo off
echo ========================================
echo DEPLOYING PROFESSIONAL UI ENHANCEMENT
echo ========================================

echo Step 1: Building optimized production build...
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
echo ✅ PROFESSIONAL UI ENHANCEMENT DEPLOYED!
echo ========================================
echo.
echo 🎨 UI Improvements Applied:
echo   • Smaller, professional search bar
echo   • Enhanced date inputs with card styling  
echo   • Professional color scheme
echo   • Better checkbox styling with hover effects
echo   • Mature, enterprise-grade design
echo.
echo 🔗 Live URL: https://stockiqfullstacktest.vercel.app
echo 📊 Orders Page: https://stockiqfullstacktest.vercel.app/order
echo.
pause