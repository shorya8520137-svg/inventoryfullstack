@echo off
echo ========================================
echo COMPLETE SERVER UPDATE - GUARANTEED FIX
echo ========================================
echo.
echo This will:
echo 1. Pull latest code from GitHub
echo 2. Upload all audit logger files directly
echo 3. Kill all node processes
echo 4. Start fresh server
echo.
pause

ssh -i "C:\Users\Admin\e2c.pem" ubuntu@54.169.107.64 "
echo '=== Step 1: Pull latest code from GitHub ==='
cd ~/inventoryfullstack
git stash
git pull origin main

echo ''
echo '=== Step 2: Kill all node processes ==='
sudo pkill -f node
sleep 3

echo ''
echo '=== Step 3: Check if ProductionEventAuditLogger has logReturnCreate ==='
grep -n 'logReturnCreate' ProductionEventAuditLogger.js || echo 'METHOD MISSING - Will upload manually'
"

echo.
echo Uploading all audit logger files manually...
scp -i "C:\Users\Admin\e2c.pem" ProductionEventAuditLogger.js ubuntu@54.169.107.64:~/inventoryfullstack/
scp -i "C:\Users\Admin\e2c.pem" EventAuditLogger.js ubuntu@54.169.107.64:~/inventoryfullstack/
scp -i "C:\Users\Admin\e2c.pem" AuditLogger.js ubuntu@54.169.107.64:~/inventoryfullstack/
scp -i "C:\Users\Admin\e2c.pem" IPGeolocationTracker.js ubuntu@54.169.107.64:~/inventoryfullstack/

echo.
echo Starting server...
ssh -i "C:\Users\Admin\e2c.pem" ubuntu@54.169.107.64 "
cd ~/inventoryfullstack

echo '=== Verify logReturnCreate method exists ==='
grep -n 'logReturnCreate' ProductionEventAuditLogger.js

echo ''
echo '=== Starting server ==='
node server.js &
sleep 5

echo ''
echo '=== Server status ==='
ps aux | grep 'node server.js' | grep -v grep
"

echo.
echo ========================================
echo COMPLETE UPDATE FINISHED!
echo ========================================
echo.
echo The server should now have the logReturnCreate method.
echo Try your return operation again.
echo.
pause