@echo off
echo ========================================
echo VERIFY NOTIFICATION TABLES UPDATED
echo ========================================
echo.
echo Checking if notification tables were updated...
echo.

ssh -i "C:\Users\Admin\e2c.pem" ubuntu@54.169.107.64 "
echo '=== CHECKING IF NOTIFICATION TABLES EXIST ==='
sudo mysql -e 'USE inventory_db; SHOW TABLES;' | grep -E '(notification|firebase)'

echo ''
echo '=== CHECKING NOTIFICATIONS TABLE STRUCTURE ==='
sudo mysql -e 'USE inventory_db; DESCRIBE notifications;'

echo ''
echo '=== CHECKING FIREBASE_TOKENS TABLE ==='
sudo mysql -e 'USE inventory_db; SHOW TABLES LIKE \"firebase_tokens\";'

echo ''
echo '=== CHECKING NOTIFICATION_SETTINGS TABLE ==='
sudo mysql -e 'USE inventory_db; SHOW TABLES LIKE \"notification_settings\";'

echo ''
echo '=== CHECKING NOTIFICATION_PREFERENCES TABLE ==='
sudo mysql -e 'USE inventory_db; SHOW TABLES LIKE \"notification_preferences\";'

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
echo '=== FINAL STATUS ==='
echo 'If you see all 4 tables above, the update was SUCCESSFUL!'
echo 'If any tables are missing, the update needs to be run again.'
"

echo.
echo ========================================
echo VERIFICATION COMPLETE
echo ========================================
echo.
pause