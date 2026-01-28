@echo off
echo ========================================
echo SSH QUICK FIX - FAST SOLUTION
echo ========================================
echo.

echo Uploading ProductionEventAuditLogger.js...
scp -i "C:\Users\Admin\e2c.pem" ProductionEventAuditLogger.js ubuntu@54.169.107.64:~/inventoryfullstack/

echo.
echo Restarting server...
ssh -i "C:\Users\Admin\e2c.pem" ubuntu@54.169.107.64 "cd ~/inventoryfullstack && sudo pkill -f node && sleep 2 && node server.js & && sleep 3 && ps aux | grep 'node server.js' | grep -v grep"

echo.
echo ========================================
echo QUICK FIX COMPLETE!
echo ========================================
echo.
echo Try your return operation now.
pause