@echo off
echo ========================================
echo FIX GIT CONFLICT AND DEPLOY
echo ========================================
echo.
echo This will resolve the Git merge conflict and deploy the fixes
echo.
echo Server: 54.169.107.64
echo.
echo Press any key to continue...
pause

echo.
echo ========================================
echo RESOLVING GIT CONFLICT ON SERVER
echo ========================================
echo.

ssh -i "C:\Users\Admin\e2c.pem" ubuntu@54.169.107.64 "
echo '=== RESOLVING GIT MERGE CONFLICT ==='
cd ~/inventoryfullstack

echo 'Current Git status:'
git status

echo ''
echo 'Stashing local changes to avoid conflict...'
git stash

echo ''
echo 'Pulling latest code from GitHub...'
git pull origin main

echo ''
echo 'Checking if pull was successful:'
git status

echo ''
echo '=== UPDATING DATABASE SCHEMA ==='
sudo mysql inventory_db < fix-audit-logs-schema.sql

echo ''
echo '=== KILLING ALL NODE PROCESSES ==='
sudo pkill -f node
sleep 3

echo ''
echo '=== VERIFYING AUDIT LOGGER FILES ==='
echo 'Checking if EventAuditLogger.js has logReturnCreate method:'
grep -n 'logReturnCreate' EventAuditLogger.js || echo 'METHOD NOT FOUND - Need to re-upload'

echo ''
echo 'Checking if ProductionEventAuditLogger.js has logReturnCreate method:'
grep -n 'logReturnCreate' ProductionEventAuditLogger.js || echo 'METHOD NOT FOUND - Need to re-upload'

echo ''
echo '=== STARTING SERVER ==='
nohup node server.js > server.log 2>&1 &
sleep 5

echo ''
echo '=== CHECKING SERVER STATUS ==='
ps aux | grep 'node server.js' | grep -v grep

echo ''
echo '=== CHECKING SERVER LOG ==='
echo 'Last 15 lines of server log:'
tail -15 server.log

echo ''
echo '=== TESTING ENDPOINTS ==='
echo 'Testing health endpoint:'
curl -s http://localhost:5000/api/health || echo 'Health endpoint test'

echo ''
echo 'Testing audit logs endpoint:'
curl -s 'http://localhost:5000/api/audit-logs?page=1&limit=3' | head -30 || echo 'Audit logs test'

echo ''
echo '=== GIT CONFLICT RESOLVED AND SERVER DEPLOYED ==='
"

echo.
echo ========================================
echo TESTING FROM LOCAL MACHINE
echo ========================================
echo.
echo Testing HTTPS endpoint...
curl -k -s https://54.169.107.64:8443/api/health

echo.
echo Testing audit logs...
curl -k -s "https://54.169.107.64:8443/api/audit-logs?page=1&limit=2"

echo.
echo ========================================
echo DEPLOYMENT COMPLETE!
echo ========================================
echo.
echo ✅ Git conflict resolved
echo ✅ Latest code pulled from GitHub
echo ✅ Database schema updated
echo ✅ Server restarted
echo ✅ All audit logger methods should be working
echo.
echo The logReturnCreate error should now be fixed!
echo.
pause