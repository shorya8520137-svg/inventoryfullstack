@echo off
echo 🔧 RESOLVING GIT CONFLICT AND DEPLOYING
echo =======================================

echo 📝 Step 1: Force pull with rebase on server
ssh -i "C:\Users\Admin\awsconection.pem" -o StrictHostKeyChecking=no ubuntu@16.171.197.86 "cd /home/ubuntu/inventoryfullstack && git config pull.rebase false && git pull origin main"

echo 🛑 Step 2: Stop server
ssh -i "C:\Users\Admin\awsconection.pem" -o StrictHostKeyChecking=no ubuntu@16.171.197.86 "pkill -f 'node server.js'"

echo 🚀 Step 3: Start server
ssh -i "C:\Users\Admin\awsconection.pem" -o StrictHostKeyChecking=no ubuntu@16.171.197.86 "cd /home/ubuntu/inventoryfullstack && nohup node server.js > server.log 2>&1 &"

echo ⏳ Step 4: Wait for server startup
timeout /t 5 /nobreak > nul

echo 🧪 Step 5: Test server
node QUICK_SERVER_TEST.js

echo ✅ DEPLOYMENT COMPLETE!