@echo off
echo 🔍 CHECKING SERVER STATUS
echo =========================

echo 📋 Check if server process is running
ssh -i "C:\Users\Admin\awsconection.pem" -o StrictHostKeyChecking=no ubuntu@16.171.197.86 "ps aux | grep 'node server.js' | grep -v grep"

echo 📋 Check server log
ssh -i "C:\Users\Admin\awsconection.pem" -o StrictHostKeyChecking=no ubuntu@16.171.197.86 "cd /home/ubuntu/inventoryfullstack && tail -10 server.log"

echo 🧪 Test server directly
ssh -i "C:\Users\Admin\awsconection.pem" -o StrictHostKeyChecking=no ubuntu@16.171.197.86 "curl -s http://localhost:3001/api/auth/test || echo 'Server not responding'"

echo ✅ STATUS CHECK COMPLETE!