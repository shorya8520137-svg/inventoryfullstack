@echo off
echo ========================================
echo SIMPLE SERVER FIX - DIRECT UPLOAD
echo ========================================
echo.

echo Uploading corrected ProductionEventAuditLogger.js...
scp -i "C:\Users\Admin\e2c.pem" ProductionEventAuditLogger.js ubuntu@54.169.107.64:~/inventoryfullstack/ProductionEventAuditLogger.js

echo.
echo Restarting server...
ssh -i "C:\Users\Admin\e2c.pem" ubuntu@54.169.107.64 "
cd ~/inventoryfullstack
echo 'Killing server...'
pkill -f 'node server.js'
sleep 2
echo 'Starting server...'
node server.js &
sleep 3
echo 'Server status:'
ps aux | grep 'node server.js' | grep -v grep
"

echo.
echo Done! Try your return operation now.
pause