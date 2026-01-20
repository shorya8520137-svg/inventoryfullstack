@echo off
echo 🔧 RESOLVING SERVER GIT CONFLICT AND RESTARTING
echo ================================================

echo 📝 Step 1: Resolve git conflict on server
ssh -i "C:\Users\Admin\awsconection.pem" -o StrictHostKeyChecking=no ubuntu@16.171.197.86 "cd /home/ubuntu/inventoryfullstack && git config pull.rebase false && git pull origin main"

echo 🛑 Step 2: Stop any running server
ssh -i "C:\Users\Admin\awsconection.pem" -o StrictHostKeyChecking=no ubuntu@16.171.197.86 "pkill -f 'node server.js' || true"

echo ⏳ Step 3: Wait for cleanup
timeout /t 3 /nobreak > nul

echo 🚀 Step 4: Start server with logs
ssh -i "C:\Users\Admin\awsconection.pem" -o StrictHostKeyChecking=no ubuntu@16.171.197.86 "cd /home/ubuntu/inventoryfullstack && nohup node server.js > server.log 2>&1 &"

echo ⏳ Step 5: Wait for server startup
timeout /t 5 /nobreak > nul

echo 📋 Step 6: Check server status
ssh -i "C:\Users\Admin\awsconection.pem" -o StrictHostKeyChecking=no ubuntu@16.171.197.86 "cd /home/ubuntu/inventoryfullstack && tail -20 server.log"

echo ✅ SERVER RESTART COMPLETE!