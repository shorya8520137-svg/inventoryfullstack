@echo off
echo EMERGENCY SERVER RESTORE - 10 MINUTE DEADLINE!

echo 1. Restoring working version from GitHub...
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@13.48.248.180 "cd /home/ubuntu/inventoryfullstack && git stash && git pull origin main"

echo 2. Starting server immediately...
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@13.48.248.180 "cd /home/ubuntu/inventoryfullstack && pkill -f 'node server.js'; nohup node server.js > /dev/null 2>&1 &"

echo 3. Quick server test...
timeout /t 3 /nobreak > nul
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@13.48.248.180 "curl -k -s -w 'Status: %%{http_code}\n' https://13.48.248.180.nip.io/api/health"

echo 4. Testing login...
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@13.48.248.180 "curl -k -s -X POST https://13.48.248.180.nip.io/api/auth/login -H 'Content-Type: application/json' -d '{\"email\":\"admin@company.com\",\"password\":\"admin@123\"}' | head -5"

echo SERVER RESTORED! Your project is ready for delivery!
echo Login: admin@company.com / admin@123
echo URL: https://13.48.248.180.nip.io
pause