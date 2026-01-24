@echo off
REM DEPLOY AUDIT SYSTEM FIXES - WINDOWS VERSION

echo 🚀 Deploying Audit System Fixes to Server
echo ==========================================

REM 1. Upload files to server
echo 📤 Step 1: Uploading files to server...
scp -i "C:\Users\Admin\awsconection.pem" EventAuditLogger.js ubuntu@16.171.5.50:/home/ubuntu/inventoryfullstack/
scp -i "C:\Users\Admin\awsconection.pem" middleware\auth.js ubuntu@16.171.5.50:/home/ubuntu/inventoryfullstack/middleware/
scp -i "C:\Users\Admin\awsconection.pem" controllers\dispatchController.js ubuntu@16.171.5.50:/home/ubuntu/inventoryfullstack/controllers/

REM 2. SSH into server and restart
echo 🔧 Step 2: Restarting server...
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.5.50 "cd /home/ubuntu/inventoryfullstack && pm2 restart server"

echo 🎉 Deployment complete!
echo 🧪 Run: node test-complete-user-journey-fixed.js
pause