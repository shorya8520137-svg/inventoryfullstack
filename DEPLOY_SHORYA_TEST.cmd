@echo off
echo 🚀 DEPLOYING SHORYA ROLE TEST
echo =============================

echo Step 1: Upload test script to server...
scp -i "C:\Users\Admin\awsconection.pem" create-shorya-role-and-test.js ubuntu@16.171.197.86:~/inventoryfullstack/

echo.
echo Step 2: Run complete test on server...
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.197.86 "cd ~/inventoryfullstack && node create-shorya-role-and-test.js"

echo.
echo ✅ SHORYA ROLE AND USER CREATED!
echo.
echo 📋 MANUAL TESTING STEPS:
echo 1. Go to: https://16.171.197.86.nip.io/login
echo 2. Login: shorya@company.com / shorya123
echo 3. Test Dispatch creation
echo 4. Test Order viewing
echo 5. Test Inventory viewing
echo.
pause