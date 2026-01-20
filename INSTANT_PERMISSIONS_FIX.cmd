@echo off
echo 🚀 INSTANT PERMISSIONS SYSTEM FIX
echo ================================

echo Step 1: Restart server with fixed JWT...
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.197.86 "cd ~/inventoryfullstack && pkill -f node && sleep 2 && nohup node server.js > server.log 2>&1 &"

echo.
echo Step 2: Testing permissions system...
node test-after-fix.js

echo.
echo Step 3: Open your permissions page...
echo 🌐 Frontend URL: https://16.171.197.86.nip.io/permissions
echo 👤 Login: admin@company.com / admin@123

echo.
echo ✅ PERMISSIONS SYSTEM SHOULD BE RUNNING!
pause