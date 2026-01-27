@echo off
echo 🔧 RESTARTING SERVER WITH NOTIFICATION FIX
echo ==========================================

echo.
echo 📋 Step 1: Connecting to server...
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.141.4 "cd /home/ubuntu/inventoryfullstack && echo '✅ Connected to server'"

echo.
echo 📋 Step 2: Pulling latest code...
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.141.4 "cd /home/ubuntu/inventoryfullstack && git pull origin main"

echo.
echo 📋 Step 3: Running notification fix...
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.141.4 "cd /home/ubuntu/inventoryfullstack && node fix-notification-system-complete.js"

echo.
echo 📋 Step 4: Restarting PM2 processes...
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.141.4 "pm2 restart all"

echo.
echo 📋 Step 5: Checking PM2 status...
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.141.4 "pm2 status"

echo.
echo 📋 Step 6: Testing notification system...
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.141.4 "cd /home/ubuntu/inventoryfullstack && node quick-notification-test.js"

echo.
echo 🎉 SERVER RESTART WITH NOTIFICATION FIX COMPLETED!
echo ✅ The IPGeolocationTracker error should now be resolved
echo ✅ Login notifications should work with location tracking
echo ✅ Try logging in again to test the fix

pause