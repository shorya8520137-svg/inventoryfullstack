@echo off
echo ========================================
echo REMOVING NOTIFICATION DROPDOWN
echo ========================================

cd /d "C:\Users\Admin\Desktop\stockiqfullstacktest"

echo.
echo [1/4] Adding changes to git...
git add .

echo.
echo [2/4] Committing changes...
git commit -m "Remove notification dropdown, make bell redirect to notifications page directly"

echo.
echo [3/4] Pushing to GitHub...
git push origin main

echo.
echo [4/4] Building and deploying to production...
call npm run build
call vercel --prod

echo.
echo ========================================
echo NOTIFICATION CHANGES DEPLOYMENT COMPLETE!
echo ========================================
echo.
echo CHANGES MADE:
echo - ❌ Removed notification dropdown completely
echo - ❌ Removed "View All Notifications" button
echo - ✅ Notification bell now redirects to /notifications page
echo - ✅ Shows only notification count in header
echo - ✅ Full notifications panel available at /notifications
echo - ✅ Updated API endpoints to correct server
echo.
echo LIVE URL: https://stockiqfullstacktest.vercel.app
echo.
echo HOW IT WORKS NOW:
echo 1. Click notification bell in header
echo 2. Redirects to full notifications page
echo 3. No more dropdown, clean header design
echo.
pause