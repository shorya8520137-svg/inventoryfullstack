@echo off
echo ========================================
echo DEPLOYING AUDIT SYSTEM FIXES NOW
echo ========================================
echo.

echo 📝 Step 1: Committing changes to Git...
git add .
git commit -m "Fix audit system: syntax error in dispatch controller and user_id NULL issues"
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
echo 🚀 NEXT: SSH to server and run these commands:
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
echo node test-audit-api-now.js
echo.
pause