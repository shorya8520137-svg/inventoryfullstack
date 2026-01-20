@echo off
echo 🔧 RESOLVING GIT CONFLICT AND STARTING SERVER
echo ===============================================

echo 📝 Step 1: Reset dispatchRoutes.js to our version
ssh -i "C:\Users\Admin\awsconection.pem" -o StrictHostKeyChecking=no ubuntu@16.171.197.86 "cd /home/ubuntu/inventoryfullstack && git checkout --ours routes/dispatchRoutes.js"

echo 📝 Step 2: Add and commit the resolved file
ssh -i "C:\Users\Admin\awsconection.pem" -o StrictHostKeyChecking=no ubuntu@16.171.197.86 "cd /home/ubuntu/inventoryfullstack && git add routes/dispatchRoutes.js && git commit -m 'Resolve merge conflict in dispatchRoutes.js'"

echo 🛑 Step 3: Kill any hanging processes
ssh -i "C:\Users\Admin\awsconection.pem" -o StrictHostKeyChecking=no ubuntu@16.171.197.86 "pkill -9 node || true"

echo 🚀 Step 4: Start server in background
ssh -i "C:\Users\Admin\awsconection.pem" -o StrictHostKeyChecking=no ubuntu@16.171.197.86 "cd /home/ubuntu/inventoryfullstack && nohup node server.js > server.log 2>&1 & sleep 3"

echo 📋 Step 5: Check if server is running
ssh -i "C:\Users\Admin\awsconection.pem" -o StrictHostKeyChecking=no ubuntu@16.171.197.86 "ps aux | grep 'node server.js' | grep -v grep"

echo 📋 Step 6: Check server log
ssh -i "C:\Users\Admin\awsconection.pem" -o StrictHostKeyChecking=no ubuntu@16.171.197.86 "cd /home/ubuntu/inventoryfullstack && tail -10 server.log"

echo 🧪 Step 7: Test API
ssh -i "C:\Users\Admin\awsconection.pem" -o StrictHostKeyChecking=no ubuntu@16.171.197.86 "curl -s http://localhost:3001/api/auth/test"

echo ✅ CONFLICT RESOLVED AND SERVER STARTED!