@echo off
echo Deploying auth controller fix...

echo Copying fixed auth controller to server...
scp -i "C:\Users\Admin\awsconection.pem" controllers/authController.js ubuntu@13.48.248.180:/home/ubuntu/inventoryfullstack/controllers/

echo Restarting server...
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@13.48.248.180 "cd /home/ubuntu/inventoryfullstack && pm2 restart server"

echo Testing login with fixed permissions...
node test-fixed-permissions-login.js

echo Auth controller fix deployed!
pause