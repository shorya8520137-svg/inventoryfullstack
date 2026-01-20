@echo off
echo Checking server logs...

echo 1. Checking if server is running...
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@13.48.248.180 "ps aux | grep 'node server.js' | grep -v grep || echo 'No server process found'"

echo.
echo 2. Checking server log file...
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@13.48.248.180 "cd /home/ubuntu/inventoryfullstack && tail -20 server.log 2>/dev/null || echo 'No server.log file found'"

echo.
echo 3. Checking for any Node.js errors...
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@13.48.248.180 "cd /home/ubuntu/inventoryfullstack && ls -la *.log 2>/dev/null || echo 'No log files found'"

echo.
echo 4. Testing server response...
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@13.48.248.180 "curl -k -s -w 'HTTP Status: %%{http_code}\n' https://13.48.248.180.nip.io/api/health || echo 'Server not responding'"

echo.
echo 5. Checking port 5000...
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@13.48.248.180 "netstat -tlnp | grep :5000 || echo 'Port 5000 not listening'"

echo.
echo 6. Manual server start (if needed)...
echo If server is not running, run: ./quick-server-restart.cmd

pause