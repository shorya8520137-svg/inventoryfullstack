@echo off
echo ========================================
echo Checking Database Storage on Server
echo ========================================

echo.
echo ========================================
echo Step 1: Check MySQL Service Status
echo ========================================
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.197.86 "sudo systemctl status mysql"

echo.
echo ========================================
echo Step 2: Check Available Databases
echo ========================================
echo Checking all databases on server...
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.197.86 "sudo mysql -e 'SHOW DATABASES;'"

echo.
echo ========================================
echo Step 3: Check Database Sizes
echo ========================================
echo Checking database sizes...
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.197.86 "sudo mysql -e 'SELECT table_schema AS Database_Name, ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS Database_Size_MB FROM information_schema.tables GROUP BY table_schema;'"

echo.
echo ========================================
echo Step 4: Check MySQL Data Directory
echo ========================================
echo Checking MySQL data directory...
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.197.86 "sudo ls -la /var/lib/mysql/"

echo.
echo ========================================
echo Step 5: Check Specific Database Files
echo ========================================
echo Looking for inventory database files...
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.197.86 "sudo find /var/lib/mysql -name '*inventory*' -type d"
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.197.86 "sudo find /var/lib/mysql -name '*inventory*' -type f -exec ls -lh {} \;"

echo.
echo ========================================
echo Step 6: Check Tables in inventory_db
echo ========================================
echo Checking tables in inventory_db...
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.197.86 "sudo mysql -e 'USE inventory_db; SHOW TABLES;'"

echo.
echo ========================================
echo Step 7: Check Table Sizes
echo ========================================
echo Checking individual table sizes...
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.197.86 "sudo mysql -e 'SELECT table_name AS Table_Name, ROUND(((data_length + index_length) / 1024 / 1024), 2) AS Table_Size_MB FROM information_schema.TABLES WHERE table_schema = \"inventory_db\" ORDER BY (data_length + index_length) DESC;'"

echo.
echo ========================================
echo Step 8: Check Disk Space
echo ========================================
echo Checking server disk space...
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.197.86 "df -h"

echo.
echo ========================================
echo Step 9: Test Database Connection
echo ========================================
echo Testing database connection...
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.197.86 "sudo mysql -e 'SELECT COUNT(*) as total_tables FROM information_schema.tables WHERE table_schema = \"inventory_db\";'"

echo.
echo ========================================
echo Analysis Complete
echo ========================================
echo This will show us:
echo - Which databases actually exist
echo - Their actual sizes
echo - Where the 89MB database is located
echo - What the correct database name is

pause