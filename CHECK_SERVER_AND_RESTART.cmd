@echo off
echo ========================================
echo CHECKING SERVER STATUS AND RESTARTING
echo ========================================

echo Step 1: Check server logs...
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.197.86 "cd /home/ubuntu/inventoryfullstack && tail -20 server.log"

echo Step 2: Kill any existing server processes...
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.197.86 "pkill -f 'node server.js'"

echo Step 3: Start server fresh...
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.197.86 "cd /home/ubuntu/inventoryfullstack && nohup node server.js > server.log 2>&1 &"

echo Step 4: Wait and check logs again...
timeout 5 > nul
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.197.86 "cd /home/ubuntu/inventoryfullstack && tail -10 server.log"

echo Step 5: Test login...
node test-login-direct.js

echo ========================================
echo SERVER RESTART COMPLETE
echo ========================================