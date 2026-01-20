@echo off
echo 🔍 Checking Server Status and Fixing
echo ====================================

echo Step 1: Check if server is running...
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.197.86 "ps aux | grep node"

echo.
echo Step 2: Kill any hanging processes...
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.197.86 "pkill -9 -f node || true"

echo.
echo Step 3: Start fresh server...
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.197.86 "cd ~/inventoryfullstack && nohup node server.js > server.log 2>&1 &"

echo.
echo Step 4: Wait and check...
timeout /t 5 /nobreak > nul
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.197.86 "ps aux | grep node && tail -5 ~/inventoryfullstack/server.log"

echo.
echo ✅ Server should be running now!
echo 🌐 Test: https://16.171.197.86.nip.io/permissions

pause