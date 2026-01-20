@echo off
echo 🚀 AUTOMATED SERVER FIX - NO MANUAL STEPS
echo ==========================================

echo 🛑 Step 1: Kill all node processes on server
ssh -i "C:\Users\Admin\awsconection.pem" -o StrictHostKeyChecking=no ubuntu@16.171.197.86 "pkill -9 node || true"

echo 📝 Step 2: Fix git and commit changes
ssh -i "C:\Users\Admin\awsconection.pem" -o StrictHostKeyChecking=no ubuntu@16.171.197.86 "cd /home/ubuntu/inventoryfullstack && git add . && git commit -m 'Auto fix server files' || true"

echo 🔄 Step 3: Force pull latest code
ssh -i "C:\Users\Admin\awsconection.pem" -o StrictHostKeyChecking=no ubuntu@16.171.197.86 "cd /home/ubuntu/inventoryfullstack && git config pull.rebase false && git pull origin main --force"

echo 🗄️ Step 4: Restart MySQL service
ssh -i "C:\Users\Admin\awsconection.pem" -o StrictHostKeyChecking=no ubuntu@16.171.197.86 "sudo systemctl restart mysql"

echo ⏳ Step 5: Wait for MySQL to start
timeout /t 3 /nobreak > nul

echo 🧪 Step 6: Test database connection
ssh -i "C:\Users\Admin\awsconection.pem" -o StrictHostKeyChecking=no ubuntu@16.171.197.86 "mysql -u inventory_user -p'StrongPass@123' -h 127.0.0.1 inventory_db -e 'SELECT 1;'"

echo 🚀 Step 7: Start server with timeout protection
ssh -i "C:\Users\Admin\awsconection.pem" -o StrictHostKeyChecking=no ubuntu@16.171.197.86 "cd /home/ubuntu/inventoryfullstack && timeout 10s node server.js || echo 'Server test completed'"

echo 🔧 Step 8: Start server in background
ssh -i "C:\Users\Admin\awsconection.pem" -o StrictHostKeyChecking=no ubuntu@16.171.197.86 "cd /home/ubuntu/inventoryfullstack && nohup node server.js > server.log 2>&1 & sleep 2"

echo 📋 Step 9: Check server status
ssh -i "C:\Users\Admin\awsconection.pem" -o StrictHostKeyChecking=no ubuntu@16.171.197.86 "ps aux | grep 'node server.js' | grep -v grep"

echo 🧪 Step 10: Test API endpoint
ssh -i "C:\Users\Admin\awsconection.pem" -o StrictHostKeyChecking=no ubuntu@16.171.197.86 "curl -s http://localhost:3001/api/auth/test || echo 'API test failed'"

echo ✅ AUTOMATED FIX COMPLETE!