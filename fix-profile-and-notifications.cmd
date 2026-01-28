@echo off
echo ========================================
echo FIXING PROFILE AND NOTIFICATIONS
echo ========================================

cd /d "C:\Users\Admin\Desktop\stockiqfullstacktest"

echo.
echo [1/4] Adding changes to git...
git add .

echo.
echo [2/4] Committing fixes...
git commit -m "Remove clear all notifications (404 errors), remove square profile background, fix padding"

echo.
echo [3/4] Pushing to GitHub...
git push origin main

echo.
echo [4/4] Building and deploying to production...
call npm run build
call vercel --prod

echo.
echo ========================================
echo FIXES DEPLOYMENT COMPLETE!
echo ========================================
echo.
echo FIXES APPLIED:
echo - ❌ Removed Clear All notifications functionality (no more 404 errors)
echo - ❌ Removed square background card from profile
echo - ✅ Clean profile design with just circular avatar
echo - ✅ Fixed padding issues
echo - ✅ Simplified hover effects
echo.
echo LIVE URL: https://stockiqfullstacktest.vercel.app
echo.
pause