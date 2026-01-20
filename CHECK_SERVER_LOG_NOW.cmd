@echo off
echo 🔍 CHECKING SERVER LOG IMMEDIATELY
echo ===================================

echo 📋 Current server log:
ssh -i "C:\Users\Admin\awsconection.pem" -o StrictHostKeyChecking=no ubuntu@16.171.197.86 "cd /home/ubuntu/inventoryfullstack && tail -30 server.log"

echo.
echo 🔄 Server processes:
ssh -i "C:\Users\Admin\awsconection.pem" -o StrictHostKeyChecking=no ubuntu@16.171.197.86 "ps aux | grep 'node server.js' | grep -v grep"

echo.
echo ✅ LOG CHECK COMPLETE!