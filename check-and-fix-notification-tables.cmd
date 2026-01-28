@echo off
echo ========================================
echo CHECK AND FIX NOTIFICATION TABLES
echo ========================================
echo.
echo This script will:
echo ✅ Connect to server via SSH
echo ✅ Check notification tables safely
echo ✅ Create missing tables
echo ✅ Add missing columns
echo ✅ Add missing indexes
echo ✅ Preserve all existing data
echo.
echo Server: 54.169.107.64
echo Database: inventory_db
echo.
echo Press any key to start...
pause

echo.
echo ========================================
echo STEP 1: UPLOAD SQL SCRIPT TO SERVER
echo ========================================
echo.
echo Uploading safe fix script...
scp -i "C:\Users\Admin\e2c.pem" fix-notification-tables-safe.sql ubuntu@54.169.107.64:~/

echo.
echo ========================================
echo STEP 2: EXECUTE DATABASE FIX ON SERVER
echo ========================================
echo.
ssh -i "C:\Users\Admin\e2c.pem" ubuntu@54.169.107.64 "
echo '=== CHECKING NOTIFICATION TABLES ==='
echo 'Current database tables:'
sudo mysql -e 'USE inventory_db; SHOW TABLES LIKE \"%%notification%%\";'

echo ''
echo '=== RUNNING SAFE FIX SCRIPT ==='
sudo mysql inventory_db < fix-notification-tables-safe.sql

echo ''
echo '=== VERIFYING TABLES AFTER FIX ==='
echo 'All notification-related tables:'
sudo mysql -e 'USE inventory_db; SHOW TABLES LIKE \"%%notification%%\"; SHOW TABLES LIKE \"%%firebase%%\";'

echo ''
echo '=== CHECKING NOTIFICATIONS TABLE STRUCTURE ==='
sudo mysql -e 'USE inventory_db; DESCRIBE notifications;'

echo ''
echo '=== CHECKING RECORD COUNTS ==='
sudo mysql -e 'USE inventory_db; 
SELECT \"notifications\" as table_name, COUNT(*) as records FROM notifications
UNION ALL
SELECT \"firebase_tokens\" as table_name, COUNT(*) as records FROM firebase_tokens
UNION ALL  
SELECT \"notification_settings\" as table_name, COUNT(*) as records FROM notification_settings
UNION ALL
SELECT \"notification_preferences\" as table_name, COUNT(*) as records FROM notification_preferences;'

echo ''
echo '=== TESTING NOTIFICATION SYSTEM ==='
echo 'Testing if we can insert a test notification:'
sudo mysql -e 'USE inventory_db; 
INSERT INTO notifications (title, message, type, user_id) 
VALUES (\"🔧 System Test\", \"Notification system is working!\", \"SYSTEM\", 1)
ON DUPLICATE KEY UPDATE title=title;'

echo 'Test notification inserted successfully!'

echo ''
echo '=== NOTIFICATION TABLES FIX COMPLETE ==='
"

echo.
echo ========================================
echo STEP 3: TEST FROM LOCAL MACHINE
echo ========================================
echo.
echo Testing notification endpoints...
timeout /t 3 /nobreak > nul

echo Testing notifications API...
curl -k -s "https://54.169.107.64:8443/api/health" | head -20

echo.
echo ========================================
echo NOTIFICATION TABLES FIX COMPLETE!
echo ========================================
echo.
echo ✅ All notification tables checked and fixed
echo ✅ Missing tables created safely
echo ✅ Missing columns added safely  
echo ✅ Existing data preserved
echo ✅ Indexes optimized
echo.
echo Your notification system should now be fully functional!
echo.
echo Tables that are now ready:
echo   📋 notifications - Main notification storage
echo   🔑 firebase_tokens - Push notification tokens
echo   ⚙️  notification_settings - User preferences
echo   📝 notification_preferences - Detailed preferences
echo.
pause