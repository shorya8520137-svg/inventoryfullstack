@echo off
echo 🔧 FINAL AUTOMATED SERVER FIX
echo ==============================

echo 🛑 Step 1: Kill all processes and clean up
ssh -i "C:\Users\Admin\awsconection.pem" -o StrictHostKeyChecking=no ubuntu@16.171.197.86 "pkill -9 node || true && rm -f /home/ubuntu/inventoryfullstack/server.log"

echo 📤 Step 2: Copy all working files to server
scp -i "C:\Users\Admin\awsconection.pem" -o StrictHostKeyChecking=no routes/dispatchRoutes.js ubuntu@16.171.197.86:/home/ubuntu/inventoryfullstack/routes/
scp -i "C:\Users\Admin\awsconection.pem" -o StrictHostKeyChecking=no middleware/auth.js ubuntu@16.171.197.86:/home/ubuntu/inventoryfullstack/middleware/

echo 🗄️ Step 3: Ensure MySQL is running
ssh -i "C:\Users\Admin\awsconection.pem" -o StrictHostKeyChecking=no ubuntu@16.171.197.86 "sudo systemctl restart mysql && sleep 3"

echo 🧪 Step 4: Test server startup (with timeout)
ssh -i "C:\Users\Admin\awsconection.pem" -o StrictHostKeyChecking=no ubuntu@16.171.197.86 "cd /home/ubuntu/inventoryfullstack && timeout 5s node server.js || echo 'Server startup test completed'"

echo 🚀 Step 5: Start server in background with proper logging
ssh -i "C:\Users\Admin\awsconection.pem" -o StrictHostKeyChecking=no ubuntu@16.171.197.86 "cd /home/ubuntu/inventoryfullstack && nohup node server.js > server.log 2>&1 & sleep 5"

echo 📋 Step 6: Check if server process is running
ssh -i "C:\Users\Admin\awsconection.pem" -o StrictHostKeyChecking=no ubuntu@16.171.197.86 "ps aux | grep 'node server.js' | grep -v grep || echo 'No server process found'"

echo 📋 Step 7: Check server log for errors
ssh -i "C:\Users\Admin\awsconection.pem" -o StrictHostKeyChecking=no ubuntu@16.171.197.86 "cd /home/ubuntu/inventoryfullstack && tail -15 server.log"

echo 🌐 Step 8: Test server response
ssh -i "C:\Users\Admin\awsconection.pem" -o StrictHostKeyChecking=no ubuntu@16.171.197.86 "curl -s -m 5 http://localhost:3001/api/auth/test || echo 'Server not responding'"

echo 🔍 Step 9: Check port 3001 status
ssh -i "C:\Users\Admin\awsconection.pem" -o StrictHostKeyChecking=no ubuntu@16.171.197.86 "netstat -tulpn | grep 3001 || echo 'Port 3001 not in use'"

echo ✅ FINAL AUTOMATED FIX COMPLETE!
echo If server is still not working, there may be a code issue that needs manual debugging.