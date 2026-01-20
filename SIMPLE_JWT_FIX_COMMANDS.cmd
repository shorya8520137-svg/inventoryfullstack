@echo off
echo 🔧 JWT Authentication Fix Commands
echo ===================================

echo.
echo Step 1: Upload fixed file to server
echo -----------------------------------
scp -i "C:\Users\Admin\awsconection.pem" routes/permissionsRoutes-fixed-jwt.js ubuntu@16.171.197.86:~/inventoryfullstack/routes/permissionsRoutes.js

echo.
echo Step 2: Restart server (run this in separate terminal)
echo -----------------------------------------------------
echo ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.197.86
echo cd ~/inventoryfullstack
echo pkill -f "node server.js" ^|^| true
echo sleep 2
echo nohup node server.js ^> server.log 2^>^&1 ^&
echo sleep 3
echo ps aux ^| grep node
echo exit

echo.
echo Step 3: Test the fix
echo --------------------
node test-jwt-token-issue.js

echo.
echo 🎉 Fix should be complete!
pause