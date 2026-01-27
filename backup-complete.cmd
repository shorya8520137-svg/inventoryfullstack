@echo off
echo ========================================
echo StockIQ Complete Backup Script
echo ========================================

REM Set simple backup directory
set BACKUP_DIR=C:\Users\Admin\Desktop\StockIQ_Complete_Backup

echo Creating backup directory: %BACKUP_DIR%
if exist "%BACKUP_DIR%" rmdir /s /q "%BACKUP_DIR%"
mkdir "%BACKUP_DIR%"

echo.
echo ========================================
echo Step 1: Downloading Project Files
echo ========================================
scp -i "C:\Users\Admin\awsconection.pem" -r ubuntu@16.171.197.86:inventoryfullstack "%BACKUP_DIR%"

echo.
echo ========================================
echo Step 2: Creating Database Backup
echo ========================================
echo Creating database dump on server...
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.197.86 "mysqldump -u root -p --single-transaction --skip-lock-tables inventory_db > ~/database_backup.sql"

echo Downloading database backup...
scp -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.197.86:database_backup.sql "%BACKUP_DIR%"

echo.
echo ========================================
echo Step 3: Creating Restore Instructions
echo ========================================
echo Creating restore guide...
(
echo STOCKIQ INVENTORY SYSTEM - COMPLETE BACKUP
echo ==========================================
echo.
echo CONTENTS:
echo - inventoryfullstack/     ^(Complete project code^)
echo - database_backup.sql     ^(MySQL database: inventory_db^)
echo.
echo TO RESTORE:
echo 1. Copy inventoryfullstack folder to your desired location
echo 2. Install dependencies: npm install
echo 3. Create database: CREATE DATABASE inventory_db;
echo 4. Import database: mysql -u root -p inventory_db ^< database_backup.sql
echo 5. Configure .env file with database connection
echo 6. Start application: npm run dev
echo.
echo ADMIN LOGIN:
echo Email: admin@company.com
echo Password: admin@123
echo.
echo LIVE SYSTEM:
echo Frontend: https://stockiqfullstacktest.vercel.app
echo Server: 16.171.197.86:5000
echo.
echo Backup Date: %date% %time%
) > "%BACKUP_DIR%\HOW_TO_RESTORE.txt"

echo.
echo ========================================
echo Step 4: Cleanup Server
echo ========================================
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.197.86 "rm -f ~/database_backup.sql"

echo.
echo ========================================
echo BACKUP COMPLETED SUCCESSFULLY!
echo ========================================
echo.
echo Location: %BACKUP_DIR%
echo.
echo Your backup contains:
echo ✓ inventoryfullstack/     (Complete project)
echo ✓ database_backup.sql     (Database: inventory_db)
echo ✓ HOW_TO_RESTORE.txt      (Instructions)
echo.

REM Open the backup folder
explorer "%BACKUP_DIR%"

echo Backup folder opened. Press any key to exit...
pause > nul