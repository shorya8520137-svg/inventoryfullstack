@echo off
echo ========================================
echo 🚨 RESTARTING SERVER WITH AUTH FIX
echo ========================================

echo.
echo ✅ Auth controller fix pushed to GitHub
echo.
echo 📋 SSH Commands to run on server:
echo.
echo ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@13.48.248.180
echo.
echo Then run these commands:
echo cd ~/inventoryfullstack
echo git pull origin main
echo pkill -f "node server.js"
echo sleep 2
echo nohup node server.js ^> server.log 2^>^&1 ^&
echo sleep 3
echo curl -k https://13.48.248.180.nip.io/api/health

echo.
echo 🧪 After server restart, test with:
echo node test-cms-login-after-fix.js

echo.
pause