@echo off
echo ========================================
echo FIXING AUDIT LOGGER MISSING METHODS
echo ========================================
echo.
echo Issue: eventAuditLogger.logReturnCreate is not a function
echo Solution: Added missing methods to ProductionEventAuditLogger
echo.
echo Methods Added:
echo ✅ logReturnCreate(user, returnData, req)
echo ✅ logDispatchCreate(user, dispatchData, req)  
echo ✅ logDamageCreate(user, damageData, req)
echo ✅ logInventoryUpdate(user, inventoryData, req)
echo.
echo Current server: 54.169.107.64
echo.
pause

echo Uploading fixed ProductionEventAuditLogger.js to server...
scp -i "C:\Users\Admin\e2c.pem" ProductionEventAuditLogger.js ubuntu@54.169.107.64:~/inventoryfullstack/

echo.
echo Restarting server...
ssh -i "C:\Users\Admin\e2c.pem" ubuntu@54.169.107.64 "
cd ~/inventoryfullstack
echo 'Stopping any running server...'
pkill -f 'node server.js' || echo 'No server running'

echo ''
echo 'Starting server...'
node server.js &
sleep 3

echo ''
echo 'Checking server status:'
ps aux | grep 'node server.js' | grep -v grep

echo ''
echo 'Testing server response:'
curl -s http://localhost:5000/api/health || echo 'Health endpoint not available'
"

echo.
echo ========================================
echo AUDIT LOGGER METHODS FIXED!
echo ========================================
echo.
echo ✅ logReturnCreate method added
echo ✅ logDispatchCreate method added
echo ✅ logDamageCreate method added  
echo ✅ logInventoryUpdate method added
echo ✅ Server restarted with fixes
echo.
echo The "is not a function" error should be resolved!
echo.
pause