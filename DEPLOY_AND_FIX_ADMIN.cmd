@echo off
echo ========================================
echo DEPLOY FIX AND TEST ADMIN LOGIN
echo ========================================

echo Step 1: Copy fix script to server...
scp -i "C:\Users\Admin\awsconection.pem" fix-admin-password-simple.js ubuntu@16.171.197.86:/home/ubuntu/inventoryfullstack/

echo Step 2: Run fix on server...
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.197.86 "cd /home/ubuntu/inventoryfullstack && node fix-admin-password-simple.js"

echo Step 3: Test login now...
node test-login-direct.js

echo ========================================
echo ADMIN FIX AND TEST COMPLETE
echo ========================================