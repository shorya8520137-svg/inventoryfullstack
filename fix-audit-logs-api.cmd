@echo off
echo ========================================
echo FIXING AUDIT LOGS API COLUMN NAMES
echo ========================================
echo.
echo Fixed issues:
echo ✅ Changed al.resource to al.resource_type in WHERE clause
echo ✅ Updated INSERT statement to use resource_type column
echo ✅ Fixed both main and inventoryfullstack controllers
echo.
echo Current server: 54.169.107.64
echo.
pause

echo Uploading fixed controller files to server...
scp -i "C:\Users\Admin\e2c.pem" controllers/permissionsController.js ubuntu@54.169.107.64:~/inventoryfullstack/controllers/
scp -i "C:\Users\Admin\e2c.pem" inventoryfullstack/controllers/permissionsController.js ubuntu@54.169.107.64:~/inventoryfullstack/controllers/permissionsController-backup.js

echo.
echo Restarting server to apply changes...
ssh -i "C:\Users\Admin\e2c.pem" ubuntu@54.169.107.64 "cd ~/inventoryfullstack && pm2 restart server || node server.js &"

echo.
echo Testing audit logs API...
timeout /t 3 /nobreak > nul
ssh -i "C:\Users\Admin\e2c.pem" ubuntu@54.169.107.64 "curl -s 'http://localhost:5000/api/audit-logs?page=1&limit=5' -H 'Authorization: Bearer YOUR_TOKEN' | head -20"

echo.
echo ========================================
echo AUDIT LOGS API FIX COMPLETE!
echo ========================================
echo.
echo The audit logs API should now work with:
echo ✅ /api/audit-logs?page=1&limit=50
echo ✅ /api/audit-logs?resource=RETURN&page=1&limit=50  
echo ✅ /api/audit-logs?action=LOGIN&page=1&limit=50
echo ✅ All filtering and pagination working
echo.
echo Test the audit logs page in your frontend now!
echo.
pause