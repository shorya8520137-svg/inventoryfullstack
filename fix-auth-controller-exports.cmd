@echo off
echo Fixing auth controller exports...

echo 1. Copying fixed auth controller to server...
scp -i "C:\Users\Admin\awsconection.pem" controllers/authController.js ubuntu@13.48.248.180:/home/ubuntu/inventoryfullstack/controllers/

echo 2. Starting server...
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@13.48.248.180 "cd /home/ubuntu/inventoryfullstack && nohup node server.js > server.log 2>&1 & echo 'Server started'"

echo 3. Waiting for server to start...
timeout /t 5 /nobreak > nul

echo 4. Testing server...
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@13.48.248.180 "curl -k -s -w 'HTTP Status: %%{http_code}\n' https://13.48.248.180.nip.io/api/health || echo 'Server check failed'"

echo 5. Testing login with fixed permissions...
node test-fixed-permissions-login.js

echo Auth controller exports fixed and server restarted!
pause