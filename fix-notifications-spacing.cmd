@echo off
echo ========================================
echo FIXING NOTIFICATIONS PAGE SPACING
echo ========================================

cd /d "C:\Users\Admin\Desktop\stockiqfullstacktest"

echo.
echo [1/4] Adding changes to git...
git add .

echo.
echo [2/4] Committing spacing fix...
git commit -m "Fix notifications page spacing - remove excessive padding, make edge-to-edge"

echo.
echo [3/4] Pushing to GitHub...
git push origin main

echo.
echo [4/4] Building and deploying to production...
call npm run build
call vercel --prod

echo.
echo ========================================
echo NOTIFICATIONS SPACING FIX COMPLETE!
echo ========================================
echo.
echo SPACING FIXES APPLIED:
echo - ❌ Removed max-width container (was max-w-4xl)
echo - ❌ Removed outer padding (was py-8 px-4)
echo - ❌ Removed rounded corners and shadows
echo - ❌ Removed margin between header and content
echo - ✅ Full width layout (max-w-full)
echo - ✅ Edge-to-edge design
echo - ✅ Clean, minimal spacing
echo.
echo LIVE URL: https://stockiqfullstacktest.vercel.app/notifications
echo.
echo NOTIFICATIONS NOW EDGE-TO-EDGE!
echo.
pause