@echo off
echo 🚀 DEPLOYING AUDIT SYSTEM FIXES TO SERVER
echo ==========================================

echo 📤 Step 1: Uploading EventAuditLogger.js...
scp -i "C:\Users\Admin\awsconection.pem" EventAuditLogger.js ubuntu@16.171.5.50:/home/ubuntu/inventoryfullstack/

echo 📤 Step 2: Uploading fixed auth middleware...
scp -i "C:\Users\Admin\awsconection.pem" middleware\auth.js ubuntu@16.171.5.50:/home/ubuntu/inventoryfullstack/middleware/

echo 📤 Step 3: Uploading fixed dispatch controller...
scp -i "C:\Users\Admin\awsconection.pem" controllers\dispatchController.js ubuntu@16.171.5.50:/home/ubuntu/inventoryfullstack/controllers/

echo 🔄 Step 4: Restarting server...
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.5.50 "cd /home/ubuntu/inventoryfullstack && pm2 restart server"

echo ✅ DEPLOYMENT COMPLETE!
echo 🧪 Now run: node test-complete-user-journey-fixed.js
pause