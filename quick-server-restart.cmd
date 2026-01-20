@echo off
echo Quick server restart...

echo 1. Killing existing server processes...
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@13.48.248.180 "pkill -f 'node server.js'; pkill -f 'npm start'; echo 'Processes killed'"

echo 2. Starting server...
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@13.48.248.180 "cd /home/ubuntu/inventoryfullstack && nohup node server.js > /dev/null 2>&1 & echo 'Server started'"

echo 3. Waiting 3 seconds...
timeout /t 3 /nobreak > nul

echo 4. Testing server...
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@13.48.248.180 "curl -k -s -o /dev/null -w '%%{http_code}' https://13.48.248.180.nip.io/api/health || echo 'Server check failed'"

echo Server restart completed!
echo.
echo Now test the permissions fix:
echo Email: nope@comp.com
echo Password: admin123
echo.
pause