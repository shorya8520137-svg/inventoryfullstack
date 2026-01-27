@echo off
echo ========================================
echo  ANALYZING SERVER NOTIFICATION TABLES
echo ========================================
echo.
echo This script will:
echo 1. SSH into server at 16.171.141.4
echo 2. Check existing notification tables
echo 3. Analyze database structure
echo 4. Provide recommendations
echo.
echo Server: 16.171.141.4
echo Database: inventory_db
echo.
pause

echo.
echo Step 1: Uploading analysis script to server...
echo.

scp -i "C:\Users\Admin\awsconection.pem" check-existing-notification-tables.js ubuntu@16.171.141.4:/home/ubuntu/inventoryfullstack/

echo.
echo Step 2: Running notification table analysis on server...
echo.

ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.141.4 "cd /home/ubuntu/inventoryfullstack && node check-existing-notification-tables.js"

echo.
echo ========================================
echo  ANALYSIS COMPLETED!
echo ========================================
echo.
echo Check the output above to understand:
echo 1. What notification tables already exist
echo 2. Their structure and data
echo 3. What needs to be created or modified
echo 4. Next steps for implementation
echo.
pause