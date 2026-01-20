@echo off
echo 🚨 EMERGENCY PROJECT RESTORE
echo ===========================

echo 🔄 Step 1: Reset server to last working commit
ssh -i "C:\Users\Admin\awsconection.pem" -o StrictHostKeyChecking=no ubuntu@16.171.197.86 "cd /home/ubuntu/inventoryfullstack && git reset --hard HEAD~10"

echo 🛑 Step 2: Kill all processes
ssh -i "C:\Users\Admin\awsconection.pem" -o StrictHostKeyChecking=no ubuntu@16.171.197.86 "pkill -9 node || true"

echo 🔄 Step 3: Force pull from GitHub
ssh -i "C:\Users\Admin\awsconection.pem" -o StrictHostKeyChecking=no ubuntu@16.171.197.86 "cd /home/ubuntu/inventoryfullstack && git fetch origin && git reset --hard origin/main"

echo 🚀 Step 4: Start server
ssh -i "C:\Users\Admin\awsconection.pem" -o StrictHostKeyChecking=no ubuntu@16.171.197.86 "cd /home/ubuntu/inventoryfullstack && nohup node server.js > server.log 2>&1 & sleep 5"

echo 📋 Step 5: Check if working
ssh -i "C:\Users\Admin\awsconection.pem" -o StrictHostKeyChecking=no ubuntu@16.171.197.86 "curl -s http://localhost:3001/api/auth/test || echo 'Still not working'"

echo ✅ PROJECT RESTORED!