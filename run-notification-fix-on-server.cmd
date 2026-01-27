@echo off
echo 🔧 RUNNING NOTIFICATION FIX ON SERVER
echo ====================================

echo.
echo 📋 Step 1: Connecting to server...
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.141.4 "echo '✅ Connected to server'"

echo.
echo 📋 Step 2: Pulling latest code...
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.141.4 "cd /home/ubuntu/inventoryfullstack && git pull origin main"

echo.
echo 📋 Step 3: Running notification fix with sudo mysql...
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.141.4 "cd /home/ubuntu/inventoryfullstack && node fix-notification-with-sudo-mysql.js"

echo.
echo 📋 Step 4: Testing notification system...
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.141.4 "cd /home/ubuntu/inventoryfullstack && node test-server-notifications.js"

echo.
echo 📋 Step 5: Restarting PM2 processes...
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.141.4 "pm2 restart all"

echo.
echo 📋 Step 6: Checking PM2 status...
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.141.4 "pm2 status"

echo.
echo 🎉 NOTIFICATION FIX COMPLETED!
echo ✅ Firebase errors should be resolved
echo ✅ Notifications should work without errors
echo ✅ Try logging in to test the fix

pause