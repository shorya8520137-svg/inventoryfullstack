@echo off
echo Starting StockIQ Server Backup...
echo ========================================

REM Create backup directory with simple name
set BACKUP_DIR=%USERPROFILE%\Desktop\StockIQ_Backup
if exist "%BACKUP_DIR%" rmdir /s /q "%BACKUP_DIR%"
mkdir "%BACKUP_DIR%"
mkdir "%BACKUP_DIR%\project"
mkdir "%BACKUP_DIR%\database"

echo Created backup directory: %BACKUP_DIR%

echo ========================================
echo STEP 1: Downloading project files...
echo ========================================

REM Download project files
scp -i "C:\Users\Admin\awsconection.pem" -r ubuntu@16.171.197.86:inventoryfullstack "%BACKUP_DIR%\project\"

echo ========================================
echo STEP 2: Creating database backup...
echo ========================================

REM Create database backup on server (you'll need to enter MySQL password)
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.197.86 "sudo mysqldump -u root -p inventory_system > stockiq_backup.sql"

REM Download database backup
scp -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.197.86:stockiq_backup.sql "%BACKUP_DIR%\database\"

echo ========================================
echo STEP 3: Cleaning up server...
echo ========================================

REM Remove temporary file from server
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.197.86 "rm -f stockiq_backup.sql"

echo ========================================
echo BACKUP COMPLETED!
echo ========================================
echo Location: %BACKUP_DIR%
echo.
echo Contents:
echo - project\inventoryfullstack (complete project)
echo - database\stockiq_backup.sql (database dump)

REM Open backup folder
explorer "%BACKUP_DIR%"

pause