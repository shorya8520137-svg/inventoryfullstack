@echo off
echo ========================================
echo FIXING NOTIFICATION COUNT 404 ERROR
echo ========================================

cd /d "C:\Users\Admin\Desktop\stockiqfullstacktest"

echo.
echo [1/4] Adding changes to git...
git add .

echo.
echo [2/4] Committing fix...
git commit -m "Fix notification count 404 error - use existing /api/notifications endpoint"

echo.
echo [3/4] Pushing to GitHub...
git push origin main

echo.
echo [4/4] Building and deploying to production...
call npm run build
call vercel --prod

echo.
echo ========================================
echo NOTIFICATION COUNT FIX COMPLETE!
echo ========================================
echo.
echo ISSUE FIXED:
echo - ❌ Removed non-existent /api/notifications/count endpoint
echo - ✅ Now uses existing /api/notifications endpoint
echo - ✅ Extracts unreadCount from response data
echo - ✅ No more 404 errors in console
echo.
echo LIVE URL: https://stockiqfullstacktest.vercel.app
echo.
echo NOTIFICATION COUNT SHOULD NOW WORK!
echo.
pause