@echo off
echo 🔥 SIMPLE FIX - Just Restart Server
echo ==================================

echo Restarting server on AWS...
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.197.86 "pkill -f node; sleep 2; cd ~/inventoryfullstack; nohup node server.js > server.log 2>&1 &"

echo.
echo ✅ Server restarted! 
echo 🌐 Go to: https://16.171.197.86.nip.io/permissions
echo 👤 Login: admin@company.com / admin@123

pause