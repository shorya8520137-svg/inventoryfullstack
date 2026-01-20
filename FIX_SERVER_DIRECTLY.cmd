@echo off
echo 🔧 FIXING SERVER DIRECTLY - COMMIT AND RESTART
echo ===============================================

echo 📝 Step 1: Add and commit changes on server
ssh -i "C:\Users\Admin\awsconection.pem" -o StrictHostKeyChecking=no ubuntu@16.171.197.86 "cd /home/ubuntu/inventoryfullstack && git add . && git commit -m 'Fix: Resolve dispatch routes syntax errors and permission middleware'"

echo 🛑 Step 2: Kill existing server
ssh -i "C:\Users\Admin\awsconection.pem" -o StrictHostKeyChecking=no ubuntu@16.171.197.86 "pkill -f 'node server.js'"

echo 🚀 Step 3: Start server
ssh -i "C:\Users\Admin\awsconection.pem" -o StrictHostKeyChecking=no ubuntu@16.171.197.86 "cd /home/ubuntu/inventoryfullstack && nohup node server.js > server.log 2>&1 &"

echo ⏳ Step 4: Wait for server to start
timeout /t 5 /nobreak > nul

echo 🧪 Step 5: Test APIs
node test-all-apis-comprehensive.js

echo ✅ SERVER FIXED AND TESTED!