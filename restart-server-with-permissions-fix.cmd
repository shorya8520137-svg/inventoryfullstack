@echo off
echo Restarting server with permissions fix...

echo 1. Stopping any existing server processes...
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@13.48.248.180 "pkill -f 'node server.js' || pkill -f 'npm start' || echo 'No existing processes found'"

echo 2. Starting server in background...
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@13.48.248.180 "cd /home/ubuntu/inventoryfullstack && nohup node server.js > server.log 2>&1 &"

echo 3. Waiting for server to start...
timeout /t 5 /nobreak > nul

echo 4. Checking server status...
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@13.48.248.180 "curl -k -s https://13.48.248.180.nip.io/api/health || echo 'Server not responding yet'"

echo 5. Testing login with fixed permissions...
node test-fixed-permissions-login.js

echo Server restart completed!
pause