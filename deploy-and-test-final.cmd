@echo off
echo Deploying JWT System and Running Tests...

echo Step 1: Upload test file...
scp -i "C:\Users\Admin\awsconection.pem" complete-api-test.js ubuntu@16.171.161.150:~/inventoryfullstack/

echo Step 2: Upload fixed auth controller...
scp -i "C:\Users\Admin\awsconection.pem" controllers/authController.js ubuntu@16.171.161.150:~/inventoryfullstack/controllers/

echo Step 3: Restart server...
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.161.150 "cd inventoryfullstack && pkill -9 node; sleep 3; nohup node server.js > server.log 2>&1 &"

echo Step 4: Wait for server to start...
timeout /t 8 /nobreak

echo Step 5: Run comprehensive API tests...
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.161.150 "cd inventoryfullstack && node complete-api-test.js"

echo.
echo Deployment and testing complete!
pause