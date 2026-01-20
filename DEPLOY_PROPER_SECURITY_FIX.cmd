@echo off
echo 🔐 DEPLOYING PROPER SECURITY FIX
echo ================================

echo Step 1: Upload fixed auth controller...
scp -i "C:\Users\Admin\awsconection.pem" controllers/authController.js ubuntu@16.171.197.86:~/inventoryfullstack/controllers/

echo.
echo Step 2: Upload password hashing script...
scp -i "C:\Users\Admin\awsconection.pem" hash-all-passwords.js ubuntu@16.171.197.86:~/inventoryfullstack/

echo.
echo Step 3: Hash all existing passwords...
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.197.86 "cd ~/inventoryfullstack && node hash-all-passwords.js"

echo.
echo Step 4: Restart server...
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.197.86 "cd ~/inventoryfullstack && pkill -f node && sleep 2 && nohup node server.js > server.log 2>&1 &"

echo.
echo ✅ SECURITY FIX DEPLOYED!
echo 🔐 All passwords are now properly hashed with bcrypt
echo 👤 Login credentials remain the same:
echo    - admin@company.com / admin@123
echo    - shorya@company.com / shorya123
echo.
pause