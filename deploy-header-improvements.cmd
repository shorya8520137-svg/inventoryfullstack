@echo off
echo ========================================
echo DEPLOYING HEADER IMPROVEMENTS
echo ========================================

cd /d "C:\Users\Admin\Desktop\stockiqfullstacktest"

echo.
echo [1/4] Adding changes to git...
git add .

echo.
echo [2/4] Committing header improvements...
git commit -m "Improve header layout: notifications right, profile left with circular avatar, animations, clear notifications"

echo.
echo [3/4] Pushing to GitHub...
git push origin main

echo.
echo [4/4] Building and deploying to production...
call npm run build
call vercel --prod

echo.
echo ========================================
echo HEADER IMPROVEMENTS DEPLOYMENT COMPLETE!
echo ========================================
echo.
echo CHANGES MADE:
echo - ✅ Notifications moved to right side
echo - ✅ Profile moved to left side  
echo - ✅ Circular profile avatar with company logo
echo - ✅ Smooth dropdown animations
echo - ✅ Clear all notifications option
echo - ✅ Improved styling and hover effects
echo.
echo LIVE URL: https://stockiqfullstacktest.vercel.app
echo.
pause