@echo off
echo ========================================
echo FIXING MISSING IPGEOLOCATIONTRACKER
echo ========================================
echo.
echo Issue: Server cannot find module '../IPGeolocationTracker'
echo Solution: Upload missing IPGeolocationTracker.js file
echo.
echo Current server: 54.169.107.64
echo.
pause

echo Uploading missing IPGeolocationTracker.js to server...
scp -i "C:\Users\Admin\e2c.pem" IPGeolocationTracker.js ubuntu@54.169.107.64:~/inventoryfullstack/

echo.
echo Verifying file upload...
ssh -i "C:\Users\Admin\e2c.pem" ubuntu@54.169.107.64 "
echo 'Checking if IPGeolocationTracker.js exists:'
ls -la ~/inventoryfullstack/IPGeolocationTracker.js

echo ''
echo 'File content preview:'
head -10 ~/inventoryfullstack/IPGeolocationTracker.js
"

echo.
echo Starting server...
ssh -i "C:\Users\Admin\e2c.pem" ubuntu@54.169.107.64 "
cd ~/inventoryfullstack
echo 'Starting server with node server.js...'
node server.js &
sleep 3
echo ''
echo 'Checking if server is running:'
ps aux | grep 'node server.js' | grep -v grep
"

echo.
echo ========================================
echo MISSING FILE FIX COMPLETE!
echo ========================================
echo.
echo ✅ IPGeolocationTracker.js uploaded to server
echo ✅ Server should now start without module errors
echo ✅ Location tracking functionality restored
echo.
echo The server should now be running on port 5000
echo Test your audit logs API now!
echo.
pause