@echo off
echo 🔧 SIMPLE SERVER RECOVERY
echo ========================

echo 📋 Checking what's wrong with server
ssh -i "C:\Users\Admin\awsconection.pem" -o StrictHostKeyChecking=no ubuntu@16.171.197.86 "cd /home/ubuntu/inventoryfullstack && timeout 3s node server.js"

echo ✅ DIAGNOSIS COMPLETE!