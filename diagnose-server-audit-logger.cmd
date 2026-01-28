@echo off
echo ========================================
echo DIAGNOSING SERVER AUDIT LOGGER ISSUE
echo ========================================
echo.
echo Checking what's actually on the server...
echo.
pause

ssh -i "C:\Users\Admin\e2c.pem" ubuntu@54.169.107.64 "
echo '=== Current directory contents ==='
cd ~/inventoryfullstack
ls -la *.js | grep -E '(Audit|Logger)'

echo ''
echo '=== Checking ProductionEventAuditLogger methods ==='
echo 'Looking for logReturnCreate method:'
grep -n 'logReturnCreate' ProductionEventAuditLogger.js || echo 'METHOD NOT FOUND!'

echo ''
echo 'Looking for logReturnEvent method:'
grep -n 'logReturnEvent' ProductionEventAuditLogger.js || echo 'METHOD NOT FOUND!'

echo ''
echo '=== Checking returns controller import ==='
echo 'Returns controller import line:'
head -5 controllers/returnsController.js

echo ''
echo '=== Checking if there are multiple audit logger files ==='
find . -name '*Audit*' -type f
find . -name '*Logger*' -type f

echo ''
echo '=== Checking git status ==='
git status

echo ''
echo '=== Checking last git pull ==='
git log --oneline -5
"

echo.
echo ========================================
echo DIAGNOSIS COMPLETE
echo ========================================
echo.
echo Check the output above to see what's on the server.
echo.
pause