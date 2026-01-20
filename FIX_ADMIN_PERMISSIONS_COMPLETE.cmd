@echo off
echo ========================================
echo FIXING ADMIN PERMISSIONS COMPLETELY
echo ========================================

echo Step 1: Copy permission fix script to server...
scp -i "C:\Users\Admin\awsconection.pem" add-missing-admin-permission.js ubuntu@16.171.197.86:/home/ubuntu/inventoryfullstack/

echo Step 2: Run permission fix on server...
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.197.86 "cd /home/ubuntu/inventoryfullstack && node add-missing-admin-permission.js"

echo Step 3: Test complete admin functionality...
node test-login-direct.js

echo ========================================
echo ADMIN PERMISSIONS FIX COMPLETE
echo ========================================