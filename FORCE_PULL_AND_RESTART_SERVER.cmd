@echo off
echo 🔧 FORCE PULL AND RESTART SERVER
echo =================================

echo 🛑 Step 1: Kill any running server
ssh -i "C:\Users\Admin\awsconection.pem" -o StrictHostKeyChecking=no ubuntu@16.171.197.86 "pkill -f 'node server.js' || true"

echo 📝 Step 2: Force resolve git conflict and pull
ssh -i "C:\Users\Admin\awsconection.pem" -o StrictHostKeyChecking=no ubuntu@16.171.197.86 "cd /home/ubuntu/inventoryfullstack && git config pull.rebase false && git pull origin main --force"

echo 🔍 Step 3: Check git status
ssh -i "C:\Users\Admin\awsconection.pem" -o StrictHostKeyChecking=no ubuntu@16.171.197.86 "cd /home/ubuntu/inventoryfullstack && git status"

echo 🚀 Step 4: Start server in background
ssh -i "C:\Users\Admin\awsconection.pem" -o StrictHostKeyChecking=no ubuntu@16.171.197.86 "cd /home/ubuntu/inventoryfullstack && nohup node server.js > server.log 2>&1 &"

echo ⏳ Step 5: Wait 3 seconds for startup
timeout /t 3 /nobreak > nul

echo 📋 Step 6: Check server log (first 20 lines)
ssh -i "C:\Users\Admin\awsconection.pem" -o StrictHostKeyChecking=no ubuntu@16.171.197.86 "cd /home/ubuntu/inventoryfullstack && head -20 server.log"

echo.
echo 🔄 Step 7: Check if server is running
ssh -i "C:\Users\Admin\awsconection.pem" -o StrictHostKeyChecking=no ubuntu@16.171.197.86 "ps aux | grep 'node server.js' | grep -v grep"

echo ✅ RESTART COMPLETE!