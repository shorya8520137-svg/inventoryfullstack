@echo off
echo 🔧 FIXING ADMIN PERMISSIONS ON SERVER
echo ====================================

echo Step 1: Upload fix script to server...
scp -i "C:\Users\Admin\awsconection.pem" fix-admin-permissions-now.js ubuntu@16.171.197.86:~/inventoryfullstack/

echo.
echo Step 2: Run fix on server...
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.197.86 "cd ~/inventoryfullstack && node fix-admin-permissions-now.js"

echo.
echo Step 3: Test permissions system...
node test-after-fix.js

echo.
echo ✅ ADMIN PERMISSIONS SHOULD BE FIXED!
pause