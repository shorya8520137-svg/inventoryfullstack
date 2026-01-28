@echo off
echo ========================================
echo FIX NOTIFICATION DATABASE NOW
echo ========================================
echo.
echo This will DIRECTLY fix the notification database
echo Using sudo mysql on server 54.169.107.64
echo.
echo Press any key to start...
pause

echo.
echo ========================================
echo STEP 1: UPLOADING SQL SCRIPT
echo ========================================
scp -i "C:\Users\Admin\e2c.pem" fix-notification-tables-safe.sql ubuntu@54.169.107.64:~/

echo.
echo ========================================
echo STEP 2: EXECUTING DATABASE FIX
echo ========================================
ssh -i "C:\Users\Admin\e2c.pem" ubuntu@54.169.107.64 "sudo mysql inventory_db < fix-notification-tables-safe.sql"

echo.
echo ========================================
echo STEP 3: VERIFYING TABLES EXIST
echo ========================================
ssh -i "C:\Users\Admin\e2c.pem" ubuntu@54.169.107.64 "sudo mysql -e 'USE inventory_db; SHOW TABLES;' | grep notification"

echo.
echo ========================================
echo STEP 4: CHECKING NOTIFICATIONS TABLE
echo ========================================
ssh -i "C:\Users\Admin\e2c.pem" ubuntu@54.169.107.64 "sudo mysql -e 'USE inventory_db; DESCRIBE notifications;'"

echo.
echo ========================================
echo STEP 5: TESTING WITH SAMPLE DATA
echo ========================================
ssh -i "C:\Users\Admin\e2c.pem" ubuntu@54.169.107.64 "sudo mysql -e \"USE inventory_db; INSERT INTO notifications (title, message, type, user_id, priority) VALUES ('Test Notification', 'Database is working!', 'SYSTEM', 1, 'low') ON DUPLICATE KEY UPDATE title=title;\""

echo.
echo ========================================
echo STEP 6: SHOWING RECENT NOTIFICATIONS
echo ========================================
ssh -i "C:\Users\Admin\e2c.pem" ubuntu@54.169.107.64 "sudo mysql -e 'USE inventory_db; SELECT id, title, message, type, created_at FROM notifications ORDER BY created_at DESC LIMIT 3;'"

echo.
echo ========================================
echo DATABASE FIX COMPLETE!
echo ========================================
echo.
echo ✅ Notification tables are now ready!
echo.
pause