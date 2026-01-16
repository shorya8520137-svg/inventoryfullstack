@echo off
echo Checking Server Status...

echo.
echo 1. Checking if Node.js process is running...
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.161.150 "ps aux | grep 'node server.js' | grep -v grep"

echo.
echo 2. Checking server logs (last 10 lines)...
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.161.150 "cd inventoryfullstack && tail -10 server.log"

echo.
echo 3. Testing health endpoint...
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.161.150 "curl -s http://localhost:5000/ --max-time 3 || echo 'Server not responding'"

pause