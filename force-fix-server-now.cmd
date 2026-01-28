@echo off
echo ========================================
echo FORCE FIX SERVER - DIRECT APPROACH
echo ========================================
echo.
echo Issue: Server still has old ProductionEventAuditLogger without logReturnCreate method
echo Solution: Force upload, kill all processes, restart fresh
echo.
pause

echo Step 1: Force uploading ALL audit logger files...
scp -i "C:\Users\Admin\e2c.pem" ProductionEventAuditLogger.js ubuntu@54.169.107.64:~/inventoryfullstack/
scp -i "C:\Users\Admin\e2c.pem" EventAuditLogger.js ubuntu@54.169.107.64:~/inventoryfullstack/
scp -i "C:\Users\Admin\e2c.pem" AuditLogger.js ubuntu@54.169.107.64:~/inventoryfullstack/
scp -i "C:\Users\Admin\e2c.pem" IPGeolocationTracker.js ubuntu@54.169.107.64:~/inventoryfullstack/

echo.
echo Step 2: Connecting to server and forcing restart...
ssh -i "C:\Users\Admin\e2c.pem" ubuntu@54.169.107.64 "
echo '=== Killing ALL node processes ==='
sudo pkill -f node || echo 'No node processes found'
sleep 2

echo ''
echo '=== Checking uploaded files ==='
ls -la ~/inventoryfullstack/ProductionEventAuditLogger.js
ls -la ~/inventoryfullstack/EventAuditLogger.js

echo ''
echo '=== Checking if logReturnCreate method exists ==='
grep -n 'logReturnCreate' ~/inventoryfullstack/ProductionEventAuditLogger.js || echo 'METHOD NOT FOUND!'

echo ''
echo '=== Starting fresh server ==='
cd ~/inventoryfullstack
nohup node server.js > server.log 2>&1 &
sleep 5

echo ''
echo '=== Checking server process ==='
ps aux | grep 'node server.js' | grep -v grep

echo ''
echo '=== Checking server log ==='
tail -20 server.log
"

echo.
echo ========================================
echo FORCE FIX COMPLETE!
echo ========================================
echo.
echo If the method is still missing, there might be a different issue.
echo Check the server log output above for any errors.
echo.
pause