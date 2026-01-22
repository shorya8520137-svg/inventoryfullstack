@echo off
echo ========================================
echo StockIQ Database Backup (Fixed)
echo ========================================

REM Set backup directory
set BACKUP_DIR=C:\Users\Admin\Desktop\StockIQ_Database_Fixed

echo Creating backup directory...
if exist "%BACKUP_DIR%" rmdir /s /q "%BACKUP_DIR%"
mkdir "%BACKUP_DIR%"

echo.
echo ========================================
echo Testing MySQL Connection Methods
echo ========================================

echo Testing MySQL access on server...
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.197.86 "echo 'Testing MySQL connections:'"

echo Method 1: Testing sudo mysql...
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.197.86 "sudo mysql -e 'SHOW DATABASES;'"

echo.
echo Method 2: Testing mysql without password...
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.197.86 "mysql -e 'SHOW DATABASES;'"

echo.
echo Method 3: Testing specific database...
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.197.86 "sudo mysql -e 'USE inventory_db; SHOW TABLES;'"

echo.
echo ========================================
echo Creating Database Backup
echo ========================================

echo Attempting database backup with sudo mysql...
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.197.86 "sudo mysqldump inventory_db > ~/stockiq_database.sql && echo 'Backup created successfully' && ls -la ~/stockiq_database.sql"

echo.
echo Downloading database backup...
scp -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.197.86:~/stockiq_database.sql "%BACKUP_DIR%/"

echo.
echo Checking downloaded file size...
dir "%BACKUP_DIR%\stockiq_database.sql"

echo.
echo ========================================
echo Alternative: Manual Database Commands
echo ========================================
echo If backup failed, try these manual commands:
echo.
echo 1. SSH to server:
echo ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.197.86
echo.
echo 2. Check databases:
echo sudo mysql -e "SHOW DATABASES;"
echo.
echo 3. Create backup:
echo sudo mysqldump inventory_db ^> stockiq_manual.sql
echo.
echo 4. Check file:
echo ls -la stockiq_manual.sql
echo.
echo 5. Download manually:
echo scp -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.197.86:~/stockiq_manual.sql "%BACKUP_DIR%/"

echo.
echo ========================================
echo Cleanup
echo ========================================
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.197.86 "rm -f ~/stockiq_database.sql"

echo.
echo ========================================
echo Results
echo ========================================
echo Backup location: %BACKUP_DIR%
echo.
if exist "%BACKUP_DIR%\stockiq_database.sql" (
    echo ✓ Database backup downloaded
    for %%A in ("%BACKUP_DIR%\stockiq_database.sql") do echo File size: %%~zA bytes
) else (
    echo ✗ Database backup failed
    echo Please try the manual commands shown above
)

explorer "%BACKUP_DIR%"

pause