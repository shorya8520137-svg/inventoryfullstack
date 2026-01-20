@echo off
echo 🔍 CHECKING CURRENT SERVER ERROR
echo ================================

echo 📋 Current server log:
ssh -i "C:\Users\Admin\awsconection.pem" -o StrictHostKeyChecking=no ubuntu@16.171.197.86 "cd /home/ubuntu/inventoryfullstack && tail -20 server.log"

echo ✅ DONE!