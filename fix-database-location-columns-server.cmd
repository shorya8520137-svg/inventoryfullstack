@echo off
echo ========================================
echo  FIXING DATABASE LOCATION COLUMNS
echo ========================================
echo.
echo This script will:
echo 1. SSH into the server
echo 2. Add missing location columns to audit_logs table
echo 3. Restart the server
echo.
echo Server: 13.60.36.159
echo Database: inventory_db
echo.
pause

echo.
echo Step 1: Connecting to server and running database migration...
echo.

ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@13.60.36.159 "cd /home/ubuntu/inventoryfullstack && node add-location-columns-to-server.js && echo 'Migration completed!' && pm2 restart all && echo 'Server restarted!' && curl -X GET 'http://localhost:3001/api/audit-logs?page=1&limit=5' && echo 'API test completed!'"

echo.
echo ========================================
echo  DATABASE MIGRATION COMPLETED!
echo ========================================
echo.
echo Next steps:
echo 1. Test the frontend audit logs page
echo 2. Verify location data is displayed
echo 3. Deploy notification system if needed
echo.
pause