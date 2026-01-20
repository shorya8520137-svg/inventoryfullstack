@echo off
echo 🔄 COPYING WORKING FILE TO SERVER
echo ==================================

echo 📤 Step 1: Copy our working dispatchRoutes.js to server
scp -i "C:\Users\Admin\awsconection.pem" -o StrictHostKeyChecking=no routes/dispatchRoutes.js ubuntu@16.171.197.86:/home/ubuntu/inventoryfullstack/routes/

echo 🛑 Step 2: Kill any running processes
ssh -i "C:\Users\Admin\awsconection.pem" -o StrictHostKeyChecking=no ubuntu@16.171.197.86 "pkill -9 node || true"

echo 🚀 Step 3: Start server
ssh -i "C:\Users\Admin\awsconection.pem" -o StrictHostKeyChecking=no ubuntu@16.171.197.86 "cd /home/ubuntu/inventoryfullstack && nohup node server.js > server.log 2>&1 & sleep 3"

echo 📋 Step 4: Check server status
ssh -i "C:\Users\Admin\awsconection.pem" -o StrictHostKeyChecking=no ubuntu@16.171.197.86 "ps aux | grep 'node server.js' | grep -v grep"

echo 📋 Step 5: Check server log
ssh -i "C:\Users\Admin\awsconection.pem" -o StrictHostKeyChecking=no ubuntu@16.171.197.86 "cd /home/ubuntu/inventoryfullstack && tail -5 server.log"

echo 🧪 Step 6: Test API
ssh -i "C:\Users\Admin\awsconection.pem" -o StrictHostKeyChecking=no ubuntu@16.171.197.86 "curl -s http://localhost:3001/api/auth/test"

echo ✅ FILE COPIED AND SERVER STARTED!