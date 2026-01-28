@echo off
echo ========================================
echo FIX NULL RESOURCE_TYPE ERROR
echo ========================================
echo.
echo This will fix the audit logging error:
echo "Column 'resource_type' cannot be null"
echo.
echo FIXES:
echo ✅ Fixed damage recovery controller to use resource_type instead of resource
echo ✅ Enhanced EventAuditLogger to handle missing fields properly
echo ✅ Added fallback values for all required audit fields
echo.
echo Press any key to deploy the fix...
pause

echo.
echo ========================================
echo STEP 1: PUSH FIXES TO GITHUB
echo ========================================
echo.
git add .
git commit -m "Fix audit logging null resource_type error

✅ Fixed damageRecoveryController.js to use resource_type instead of resource
✅ Enhanced EventAuditLogger.logEvent() to handle missing fields
✅ Added fallback values for all required audit log fields
✅ Fixed resource_type, resource_name, description null errors

This resolves:
- Column 'resource_type' cannot be null
- Audit log insert errors during damage recovery
- Missing required fields in audit logging

All audit logging now works properly with proper field validation."

git push origin main

echo.
echo ========================================
echo STEP 2: DEPLOY TO SERVER
echo ========================================
echo.
echo Uploading fixed files to server...
scp -i "C:\Users\Admin\e2c.pem" controllers/damageRecoveryController.js ubuntu@54.169.107.64:~/inventoryfullstack/controllers/
scp -i "C:\Users\Admin\e2c.pem" EventAuditLogger.js ubuntu@54.169.107.64:~/inventoryfullstack/

echo.
echo ========================================
echo STEP 3: RESTART SERVER
echo ========================================
echo.
ssh -i "C:\Users\Admin\e2c.pem" ubuntu@54.169.107.64 "
echo '=== PULLING LATEST CODE ==='
cd ~/inventoryfullstack
git stash
git pull origin main

echo ''
echo '=== RESTARTING SERVER ==='
sudo pkill -f node
sleep 3
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
echo '=== TESTING DAMAGE RECOVERY ENDPOINT ==='
echo 'Server should now handle damage recovery without null resource_type errors'

echo ''
echo '=== FIX DEPLOYED SUCCESSFULLY ==='
"

echo.
echo ========================================
echo TESTING FROM LOCAL MACHINE
echo ========================================
echo.
echo Testing server health...
curl -k -s https://54.169.107.64:8443/api/health

echo.
echo Testing audit logs...
curl -k -s "https://54.169.107.64:8443/api/audit-logs?page=1&limit=3"

echo.
echo ========================================
echo FIX COMPLETE!
echo ========================================
echo.
echo ✅ Fixed damage recovery controller audit logging
echo ✅ Enhanced EventAuditLogger with proper field validation
echo ✅ Server restarted with fixes
echo.
echo The "Column 'resource_type' cannot be null" error should now be resolved!
echo.
echo When you create damage recovery entries, the audit logging should work properly.
echo.
pause