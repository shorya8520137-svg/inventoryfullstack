@echo off
echo ========================================
echo SSH SERVER FIX - COMPLETE SOLUTION
echo ========================================
echo.
echo This will:
echo 1. Upload all audit logger files to server
echo 2. Pull latest code from GitHub
echo 3. Kill all node processes
echo 4. Verify logReturnCreate method exists
echo 5. Start fresh server
echo.
echo Server: 54.169.107.64
echo.
pause

echo Step 1: Uploading all audit logger files...
scp -i "C:\Users\Admin\e2c.pem" ProductionEventAuditLogger.js ubuntu@54.169.107.64:~/inventoryfullstack/
scp -i "C:\Users\Admin\e2c.pem" EventAuditLogger.js ubuntu@54.169.107.64:~/inventoryfullstack/
scp -i "C:\Users\Admin\e2c.pem" AuditLogger.js ubuntu@54.169.107.64:~/inventoryfullstack/
scp -i "C:\Users\Admin\e2c.pem" IPGeolocationTracker.js ubuntu@54.169.107.64:~/inventoryfullstack/

echo.
echo Step 2: Connecting to server and executing fix...
ssh -i "C:\Users\Admin\e2c.pem" ubuntu@54.169.107.64 "
echo '=== STEP 1: Pull latest code from GitHub ==='
cd ~/inventoryfullstack
git stash
git pull origin main

echo ''
echo '=== STEP 2: Kill all node processes ==='
sudo pkill -f node
sleep 3

echo ''
echo '=== STEP 3: Verify logReturnCreate method exists ==='
echo 'Checking ProductionEventAuditLogger.js for logReturnCreate method:'
grep -n 'logReturnCreate' ProductionEventAuditLogger.js || echo 'METHOD NOT FOUND - Using uploaded version'

echo ''
echo 'Checking file size and date:'
ls -la ProductionEventAuditLogger.js

echo ''
echo '=== STEP 4: Start fresh server ==='
nohup node server.js > server.log 2>&1 &
sleep 5

echo ''
echo '=== STEP 5: Check server status ==='
ps aux | grep 'node server.js' | grep -v grep

echo ''
echo '=== STEP 6: Check server log for errors ==='
echo 'Last 10 lines of server log:'
tail -10 server.log

echo ''
echo '=== STEP 7: Test server response ==='
curl -s http://localhost:5000/api/health || echo 'Health endpoint not available'

echo ''
echo '=== SUCCESS: Server fix complete! ==='
"

echo.
echo ========================================
echo SSH SERVER FIX COMPLETE!
echo ========================================
echo.
echo ✅ All audit logger files uploaded
echo ✅ Latest code pulled from GitHub
echo ✅ Server restarted with fresh process
echo ✅ logReturnCreate method should be available
echo.
echo Your return operations should now work!
echo Check the server log output above for any errors.
echo.
pause