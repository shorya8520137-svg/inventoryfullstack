@echo off
echo ========================================
echo DEPLOYING COMPLETE AUDIT SYSTEM
echo ========================================
echo.

echo 📝 Step 1: Committing changes to Git...
git add .
git commit -m "Complete audit system: LOGIN/DISPATCH/LOGOUT events + frontend audit logs page"
if %errorlevel% neq 0 (
    echo ❌ Git commit failed
    pause
    exit /b 1
)

echo 📤 Step 2: Pushing to GitHub...
git push origin main
if %errorlevel% neq 0 (
    echo ❌ Git push failed
    pause
    exit /b 1
)

echo ✅ Changes pushed to GitHub successfully!
echo.
echo 🚀 WHAT WAS DEPLOYED:
echo ========================================
echo ✅ LOGIN audit logging (with IP and user agent)
echo ✅ LOGOUT audit logging (with IP and user agent)  
echo ✅ DISPATCH audit logging (with complete details)
echo ✅ Frontend Audit Logs page (/audit-logs)
echo ✅ Audit Logs navigation in sidebar
echo ✅ Complete user journey tracking
echo.
echo 🔧 NEXT: SSH to server and run these commands:
echo ========================================
echo ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.5.50
echo.
echo Then run on server:
echo cd /home/ubuntu/inventoryfullstack
echo git pull origin main
echo pm2 restart server
echo pm2 logs server --lines 20
echo.
echo 🧪 AFTER SERVER RESTART, TEST WITH:
echo node test-complete-user-journey-audit.js
echo.
echo 🌐 FRONTEND ACCESS:
echo https://16.171.5.50.nip.io/audit-logs
echo.
pause