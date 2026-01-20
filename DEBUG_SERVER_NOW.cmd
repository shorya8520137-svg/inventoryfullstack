@echo off
echo 🔍 DEBUG SERVER STATUS
echo ======================

echo Checking server processes...
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.197.86 "ps aux | grep node"

echo.
echo Checking server logs...
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.197.86 "tail -10 ~/inventoryfullstack/server.log"

echo.
echo Checking if port 5000 is listening...
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.197.86 "netstat -tlnp | grep :5000"

echo.
echo Trying to start server manually...
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.197.86 "cd ~/inventoryfullstack && node server.js"

pause