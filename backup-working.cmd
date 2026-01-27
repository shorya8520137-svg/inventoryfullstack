@echo off
echo Starting StockIQ Server Backup (Fixed Version)...
echo ========================================

REM Create backup directory with timestamp
set TIMESTAMP=%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%
set TIMESTAMP=%TIMESTAMP: =0%
set BACKUP_DIR=C:\Users\Admin\Desktop\StockIQ_Backup_%TIMESTAMP%

echo Creating backup directory: %BACKUP_DIR%
if exist "%BACKUP_DIR%" rmdir /s /q "%BACKUP_DIR%"
mkdir "%BACKUP_DIR%"

echo ========================================
echo STEP 1: Downloading project files...
echo ========================================

REM Download project files directly to backup directory
echo Downloading inventoryfullstack project...
scp -i "C:\Users\Admin\awsconection.pem" -r ubuntu@16.171.197.86:inventoryfullstack "%BACKUP_DIR%\"

echo ========================================
echo STEP 2: Creating database backup...
echo ========================================

REM Create database backup with --single-transaction and --skip-lock-tables to avoid definer issues
echo Creating backup of database: inventory_db (with fixed options)
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.197.86 "mysqldump -u root -p --single-transaction --skip-lock-tables --no-tablespaces inventory_db > stockiq_backup.sql"

REM Download database backup
echo Downloading database backup...
scp -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.197.86:stockiq_backup.sql "%BACKUP_DIR%\"

echo ========================================
echo STEP 3: Creating backup documentation...
echo ========================================

REM Create backup info file
echo Creating backup documentation...
echo StockIQ Inventory Management System - Complete Backup > "%BACKUP_DIR%\BACKUP_INFO.txt"
echo ===================================================== >> "%BACKUP_DIR%\BACKUP_INFO.txt"
echo Backup Date: %date% %time% >> "%BACKUP_DIR%\BACKUP_INFO.txt"
echo Server: ubuntu@16.171.197.86 >> "%BACKUP_DIR%\BACKUP_INFO.txt"
echo Database: inventory_db >> "%BACKUP_DIR%\BACKUP_INFO.txt"
echo. >> "%BACKUP_DIR%\BACKUP_INFO.txt"
echo CONTENTS: >> "%BACKUP_DIR%\BACKUP_INFO.txt"
echo ========= >> "%BACKUP_DIR%\BACKUP_INFO.txt"
echo 1. inventoryfullstack/ - Complete project files >> "%BACKUP_DIR%\BACKUP_INFO.txt"
echo 2. stockiq_backup.sql - Database dump (inventory_db) >> "%BACKUP_DIR%\BACKUP_INFO.txt"
echo. >> "%BACKUP_DIR%\BACKUP_INFO.txt"
echo RESTORATION: >> "%BACKUP_DIR%\BACKUP_INFO.txt"
echo ============ >> "%BACKUP_DIR%\BACKUP_INFO.txt"
echo 1. Copy inventoryfullstack folder to desired location >> "%BACKUP_DIR%\BACKUP_INFO.txt"
echo 2. Run: npm install >> "%BACKUP_DIR%\BACKUP_INFO.txt"
echo 3. Create database: CREATE DATABASE inventory_db; >> "%BACKUP_DIR%\BACKUP_INFO.txt"
echo 4. Import: mysql -u root -p inventory_db ^< stockiq_backup.sql >> "%BACKUP_DIR%\BACKUP_INFO.txt"
echo 5. Configure .env file and start application >> "%BACKUP_DIR%\BACKUP_INFO.txt"
echo. >> "%BACKUP_DIR%\BACKUP_INFO.txt"
echo ADMIN CREDENTIALS: >> "%BACKUP_DIR%\BACKUP_INFO.txt"
echo Email: admin@company.com >> "%BACKUP_DIR%\BACKUP_INFO.txt"
echo Password: admin@123 >> "%BACKUP_DIR%\BACKUP_INFO.txt"
echo. >> "%BACKUP_DIR%\BACKUP_INFO.txt"
echo LIVE FRONTEND: https://stockiqfullstacktest.vercel.app >> "%BACKUP_DIR%\BACKUP_INFO.txt"

echo ========================================
echo STEP 4: Cleaning up server...
echo ========================================

REM Remove temporary file from server
echo Removing temporary files from server...
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.197.86 "rm -f stockiq_backup.sql"

echo ========================================
echo BACKUP COMPLETED SUCCESSFULLY!
echo ========================================
echo.
echo Backup Location: %BACKUP_DIR%
echo.
echo Contents:
echo - inventoryfullstack\ (complete project)
echo - stockiq_backup.sql (database: inventory_db)
echo - BACKUP_INFO.txt (restoration instructions)
echo.
echo Your complete StockIQ system is now backed up!

REM Open backup folder
explorer "%BACKUP_DIR%"

echo.
echo Press any key to exit...
pause > nul