@echo off
echo ========================================
echo 🚨 EMERGENCY SERVER FIX - AUTH CONTROLLER
echo ========================================

echo.
echo 1. Auth controller exports fixed
echo 2. Added missing getCurrentUser function
echo 3. Restarting server...

echo.
echo SSH Command to restart server:
echo ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@13.48.248.180

echo.
echo Commands to run on server:
echo cd ~/inventoryfullstack
echo pkill -f "node server.js"
echo nohup node server.js ^> server.log 2^>^&1 ^& 
echo sleep 3
echo curl -k https://13.48.248.180.nip.io/api/health

echo.
echo 4. Testing login with CMS user...
echo.

pause