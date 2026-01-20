@echo off
echo 🚀 DIRECT SERVER FIX - NO GIT COMPLICATIONS
echo ==========================================

echo Step 1: Upload fixed server.js directly...
scp -i "C:\Users\Admin\awsconection.pem" server.js ubuntu@16.171.197.86:~/inventoryfullstack/

echo.
echo Step 2: Restart server...
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.197.86 "cd ~/inventoryfullstack && pkill -f node && sleep 2 && nohup node server.js > server.log 2>&1 &"

echo.
echo Step 3: Test permissions system...
timeout /t 5 /nobreak > nul
node test-after-fix.js

echo.
echo ✅ PERMISSIONS SYSTEM SHOULD BE WORKING NOW!
echo 🌐 Go to: https://16.171.197.86.nip.io/permissions
echo 👤 Login: admin@company.com / admin@123

pause