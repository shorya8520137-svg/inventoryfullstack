@echo off
echo ========================================
echo  TESTING NOTIFICATION MODULE
echo ========================================
echo.
echo This script will:
echo 1. SSH into server at 16.171.141.4
echo 2. Pull latest code changes
echo 3. Run comprehensive notification tests
echo 4. Verify all functionality works
echo.
echo Server: 16.171.141.4
echo Database: inventory_db
echo.
pause

echo.
echo Step 1: Connecting to server and updating code...
echo.

ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.141.4 "cd /home/ubuntu/inventoryfullstack && git pull origin main && echo 'Code updated successfully!'"

echo.
echo Step 2: Running notification system tests...
echo.

ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.141.4 "cd /home/ubuntu/inventoryfullstack && node test-existing-notification-system.js"

echo.
echo ========================================
echo  NOTIFICATION MODULE TEST COMPLETED!
echo ========================================
echo.
echo Check the output above to see:
echo 1. Database connection status
echo 2. Table verification results
echo 3. Notification creation tests
echo 4. User preference tests
echo 5. Firebase token tests
echo 6. Event notification tests
echo 7. Performance test results
echo.
echo If all tests pass, the notification system is ready!
echo.
pause